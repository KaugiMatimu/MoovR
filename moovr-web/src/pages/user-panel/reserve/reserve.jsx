import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BaseURL } from "../../../utils/BaseURL";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/user-panel/header";
import Carousel from "../../../components/user-panel/carousel";

const Reserve = () => {
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [pickupPlaceId, setPickupPlaceId] = useState(null);
  const [dropoffPlaceId, setDropoffPlaceId] = useState(null);
  const [isMapsReady, setIsMapsReady] = useState(false);
  const [distance, setDistance] = useState(null);
  const [pickupType, setPickupType] = useState("now");
  const [scheduleTime, setScheduleTime] = useState("");
  const mapRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const mapInstance = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!window.google) {
        const script = document.createElement("script");
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      const google = window.google;
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: 51.505, lng: -0.09 },
        zoom: 13,
      });

      directionsServiceRef.current = new google.maps.DirectionsService();
      directionsRendererRef.current = new google.maps.DirectionsRenderer();
      directionsRendererRef.current.setMap(mapInstance.current);

      initializeAutocomplete("pickup");
      initializeAutocomplete("dropoff");

      setIsMapsReady(true);
      fetchCurrentLocation();
    };

    const fetchCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: pos }, (results, status) => {
              if (status === "OK") {
                const bestResult = chooseBestGeocoderResult(results);
                if (bestResult) {
                  const readableAddress = getReadableAddressFromResult(bestResult);
                  setPickupLocation(pos);
                  setPickupAddress(readableAddress);
                  setPickupPlaceId(bestResult.place_id || null);
                  const pickupInput = document.getElementById("pickup-input");
                  if (pickupInput) {
                    pickupInput.value = readableAddress;
                  }
                  mapInstance.current.setCenter(pos);
                  mapInstance.current.setZoom(14);
                }
              } else {
                console.error("Geocoder failed due to: " + status);
              }
            });
          },
          () => {
            console.info("Geolocation permission denied or error occurred.");
          }
        );
      }
    };

    const isPlusCodeAddress = (address) => {
      return /^\\s*[A-Z0-9]{2,}\+[A-Z0-9]{3,}/.test(address || "");
    };

    const getFormattedAddress = (addressComponents) => {
      if (!Array.isArray(addressComponents)) return "";

      const preferredTypes = [
        "street_number",
        "route",
        "sublocality_level_1",
        "locality",
        "administrative_area_level_1",
        "country",
      ];

      const valuesByType = {};
      addressComponents.forEach((component) => {
        component.types.forEach((type) => {
          if (!valuesByType[type]) {
            valuesByType[type] = component.long_name;
          }
        });
      });

      const parts = preferredTypes
        .map((type) => valuesByType[type])
        .filter(Boolean);

      if (parts.length > 0) {
        return parts.join(", ");
      }

      return addressComponents
        .map((component) => component.long_name)
        .filter(Boolean)
        .join(", ");
    };

    const chooseBestGeocoderResult = (results) => {
      if (!Array.isArray(results) || results.length === 0) return null;

      const scored = results.map((result) => {
        let score = 0;
        const address = result.formatted_address || "";
        const types = Array.isArray(result.types) ? result.types : [];

        if (result.address_components) score += 20;
        if (address && !isPlusCodeAddress(address)) score += 30;
        if (types.includes("street_address")) score += 15;
        if (types.includes("route")) score += 10;
        if (types.includes("locality")) score += 8;
        if (types.includes("sublocality") || types.includes("sublocality_level_1")) score += 6;
        if (types.includes("administrative_area_level_1")) score += 4;
        if (types.includes("country")) score += 2;

        return { result, score };
      });

      scored.sort((a, b) => b.score - a.score);
      return scored[0]?.result || results[0];
    };

    const getReadableAddressFromResult = (result) => {
      if (!result) return "";
      const address = result.formatted_address || "";
      if (address && !isPlusCodeAddress(address)) {
        return address;
      }
      if (result.address_components) {
        return getFormattedAddress(result.address_components);
      }
      return result.name || address || "";
    };

    const initializeAutocomplete = (type) => {
      const input = document.getElementById(`${type}-input`);
      const autocomplete = new google.maps.places.Autocomplete(input, {
        fields: ["formatted_address", "geometry", "address_components"],
        types: ["geocode"],
      });
      autocomplete.bindTo("bounds", mapInstance.current);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        const formattedAddress = getReadableAddressFromResult(place);
        const placeId = place.place_id || null;

        if (type === "pickup") {
          setPickupLocation(location);
          setPickupAddress(formattedAddress);
          setPickupPlaceId(placeId);
        } else {
          setDropoffLocation(location);
          setDropoffAddress(formattedAddress);
          setDropoffPlaceId(placeId);
        }

        if (input) {
          input.value = formattedAddress;
        }

        mapInstance.current.setCenter(place.geometry.location);
        mapInstance.current.setZoom(14);
      });
    };

    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      calculateAndDisplayRoute();
    }
  }, [pickupLocation, dropoffLocation]);

  const calculateAndDisplayRoute = () => {
    const directionsService = directionsServiceRef.current;
    const directionsRenderer = directionsRendererRef.current;

    if (!directionsService || !directionsRenderer) {
      console.error("Google Maps services not initialized yet.");
      return;
    }

    directionsService.route(
      {
        origin: pickupLocation,
        destination: dropoffLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);
          const route = result.routes[0];
          const distanceInKm = route.legs[0].distance.value / 1000;
          setDistance(distanceInKm);
        } else {
          console.error(`Directions request failed due to ${status}`);
        }
      }
    );
  };

  const handleCreateRide = async () => {
    if (!pickupLocation || !dropoffLocation || distance === null) {
      alert("Please enter valid pickup and dropoff locations.");
      return;
    }

    const rideData = {
      pickupLocation: pickupAddress,
      dropoffLocation: dropoffAddress,
      pickupCoordinates: [pickupLocation.lng, pickupLocation.lat],
      dropoffCoordinates: [dropoffLocation.lng, dropoffLocation.lat],
      pickupPlaceId: pickupPlaceId,
      dropoffPlaceId: dropoffPlaceId,
      distance,
      pickupType,
      scheduleTime: pickupType === "later" ? scheduleTime : null,
    };

    try {
      const response = await axios.post(`${BaseURL}/intercityrides/create`, rideData, {
        headers: {
          Authorization: token,
        },
      });
      alert("Ride created successfully: " + response.data.message);

      // Open full map with pickup and dropoff markers
      const google = window.google;
      const fullMap = new google.maps.Map(mapRef.current, {
        center: pickupLocation,
        zoom: 10,
      });

      new google.maps.Marker({
        position: pickupLocation,
        map: fullMap,
        label: "P",
      });

      new google.maps.Marker({
        position: dropoffLocation,
        map: fullMap,
        label: "D",
      });

      directionsRendererRef.current.setMap(fullMap);
      directionsRendererRef.current.setDirections(null);
      calculateAndDisplayRoute();
    } catch (error) {
      console.error("Error creating ride:", error);
      alert("Failed to create ride. Please try again.");
    }
  };
  return (
    <div>
      <Header />
      <div className="max-w-[1180px] mx-auto min-h-[500px] items-center p-4">
        <div className="bg-white p-8 rounded-lg w-full max-w-6xl mx-auto ">
          <h3 className="text-xl font-semibold mb-4">Get your ride</h3>
          <div className="flex flex-col items-center lg:flex-row gap-6">
            {/* Input Fields */}
            <form className="space-y-6 w-full lg:w-1/2">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-4">
                <input
                  id="pickup-input"
                  type="text"
                  placeholder="Enter pickup city"
                  className="bg-transparent focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center bg-gray-100 rounded-full px-4 py-4">
                <input
                  id="dropoff-input"
                  type="text"
                  placeholder="Enter dropoff city"
                  className="bg-transparent focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center bg-gray-100 rounded-full px-4 py-4">
                <select
                  value={pickupType}
                  onChange={(e) => setPickupType(e.target.value)}
                  className="bg-transparent focus:outline-none w-full"
                >
                  <option value="now">Pickup Now</option>
                  <option value="later">Schedule Later</option>
                </select>
              </div>

              {pickupType === "later" && (
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-4">
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="bg-transparent focus:outline-none w-full"
                    placeholder="Pickup Time"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleCreateRide}
                disabled={!isMapsReady || !pickupLocation || !dropoffLocation}
                className={`w-full py-3 text-lg rounded-full ${
                  isMapsReady && pickupLocation && dropoffLocation
                    ? "bg-purple-500 text-white hover:bg-purple-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Create Ride
              </button>
            </form>

            {/* Map Section */}
            <div
              ref={mapRef}
              className="w-full lg:w-1/2 h-64 lg:h-[250px] xl:h-[350px] rounded-lg"
            ></div>
          </div>
        </div>
        {/* <Map /> */}
      </div>
      <Carousel />
    </div>
  );
};

export default Reserve;
