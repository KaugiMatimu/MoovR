import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { DotLoader } from "react-spinners";

const RideForm = () => {
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
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const mapRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const navigate = useNavigate();

  const loadGoogleMapsScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const existingScript = document.getElementById("googleMapsScript");
      if (existingScript) {
        existingScript.onload = resolve;
        return;
      }

      const script = document.createElement("script");
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      script.id = "googleMapsScript";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  const getFormattedAddress = useCallback((addressComponents) => {
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

    return addressComponents.map((component) => component.long_name).filter(Boolean).join(", ");
  }, []);

  const isPlusCodeAddress = (address) => {
    return /^\s*[A-Z0-9]{2,}\+[A-Z0-9]{3,}/.test(address || "");
  };

  const chooseBestGeocoderResult = useCallback((results) => {
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
    return scored[0]?.result ?? results[0];
  }, []);

  const getReadableAddressFromResult = useCallback(
    (result) => {
      if (!result) return "";
      const address = result.formatted_address || "";
      const readable = address && !isPlusCodeAddress(address)
        ? address
        : result.address_components
          ? getFormattedAddress(result.address_components)
          : result.name || address;
      return readable || "";
    },
    [getFormattedAddress]
  );

  const initializeAutocomplete = useCallback(
    (type) => {
      if (!window.google || !window.google.maps) return;
      const input = document.getElementById(`${type}-input`);
      if (!input) return;

      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        fields: ["formatted_address", "geometry", "address_components"],
        types: ["geocode"],
      });
      autocomplete.bindTo("bounds", mapInstanceRef.current);

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

        mapInstanceRef.current.setCenter(place.geometry.location);
        mapInstanceRef.current.setZoom(14);
      });
    },
    [getFormattedAddress]
  );

  const fetchCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetectingLocation(true);
    setLocationError("");

    const processPosition = (position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      if (!window.google || !window.google.maps) {
        setPickupLocation(pos);
        setPickupAddress("Current Location");
        setIsDetectingLocation(false);
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: pos }, (results, status) => {
        if (status === "OK" && results?.length) {
          const bestResult = chooseBestGeocoderResult(results);
          setPickupLocation(pos);
          setPickupAddress(getReadableAddressFromResult(bestResult));
          setPickupPlaceId(bestResult?.place_id || null);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(pos);
            mapInstanceRef.current.setZoom(14);
          }
        } else {
          setPickupLocation(pos);
          setPickupAddress("Current Location");
          setLocationError("Unable to resolve your address. Using your current location.");
          console.error("Geocoder failed due to:", status);
        }
        setIsDetectingLocation(false);
      });
    };

    // Try to get current position with a larger timeout
    navigator.geolocation.getCurrentPosition(
      processPosition,
      (error) => {
        if (error.code === error.TIMEOUT) {
          // On timeout, retry silently using watchPosition with a longer timeout.
          let retryWatchId = null;
          retryWatchId = navigator.geolocation.watchPosition(
            (pos) => {
              processPosition(pos);
              if (retryWatchId !== null) navigator.geolocation.clearWatch(retryWatchId);
            },
            (err2) => {
              switch (err2.code) {
                case err2.PERMISSION_DENIED:
                  setLocationError("Location access denied. Please enable location permissions in your browser.");
                  break;
                case err2.POSITION_UNAVAILABLE:
                  setLocationError("Location information is unavailable.");
                  break;
                case err2.TIMEOUT:
                  setLocationError("Unable to detect your location. Please enter pickup manually.");
                  break;
                default:
                  setLocationError("Unable to detect your location. Please enter pickup manually.");
                  break;
              }
              setIsDetectingLocation(false);
              if (retryWatchId !== null) navigator.geolocation.clearWatch(retryWatchId);
            },
            { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 }
          );
        } else {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError("Location access denied. Please enable location permissions in your browser.");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Location information is unavailable.");
              break;
            default:
              setLocationError("Unable to detect your location. Please enter pickup manually.");
              break;
          }
          setIsDetectingLocation(false);
        }
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  }, []);

  const initializeMap = useCallback(() => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps was not loaded properly.");
      return;
    }

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 51.505, lng: -0.09 },
      zoom: 13,
    });

    directionsServiceRef.current = new window.google.maps.DirectionsService();
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer();
    directionsRendererRef.current.setMap(mapInstanceRef.current);

    initializeAutocomplete("pickup");
    initializeAutocomplete("dropoff");

    setIsMapsReady(true);
    fetchCurrentLocation();
  }, [fetchCurrentLocation, initializeAutocomplete]);

  useEffect(() => {
    loadGoogleMapsScript()
      .then(initializeMap)
      .catch(() => toast.error("Failed to load Google Maps script."));
  }, [initializeMap, loadGoogleMapsScript]);

  useEffect(() => {
    if (!pickupLocation || !dropoffLocation) return;

    const directionsService = directionsServiceRef.current;
    const directionsRenderer = directionsRendererRef.current;

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
          toast.error("Route calculation failed: " + status);
        }
      }
    );
  }, [pickupLocation, dropoffLocation]);

  const geocodeAddress = useCallback((address) => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) {
        reject("Google Maps is not ready");
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results?.length) {
          const bestResult = chooseBestGeocoderResult(results);
          resolve({
            lat: bestResult.geometry.location.lat(),
            lng: bestResult.geometry.location.lng(),
            formatted_address: getReadableAddressFromResult(bestResult),
            place_id: bestResult.place_id,
          });
        } else {
          reject(status);
        }
      });
    });
  }, [chooseBestGeocoderResult, getReadableAddressFromResult]);

  const handleSeePricing = async () => {
    setIsLoading(true);
    setLocationError("");

    try {
      let currentPickup = pickupLocation;
      let currentDropoff = dropoffLocation;
      let currentPickupAddr = pickupAddress.trim();
      let currentDropoffAddr = dropoffAddress.trim();
      let currentPickupId = pickupPlaceId;
      let currentDropoffId = dropoffPlaceId;

      if (!currentPickup && currentPickupAddr) {
        const result = await geocodeAddress(currentPickupAddr);
        currentPickup = { lat: result.lat, lng: result.lng };
        currentPickupAddr = result.formatted_address;
        currentPickupId = result.place_id || null;
        setPickupLocation(currentPickup);
        setPickupAddress(currentPickupAddr);
        setPickupPlaceId(currentPickupId);
      }

      if (!currentDropoff && currentDropoffAddr) {
        const result = await geocodeAddress(currentDropoffAddr);
        currentDropoff = { lat: result.lat, lng: result.lng };
        currentDropoffAddr = result.formatted_address;
        currentDropoffId = result.place_id || null;
        setDropoffLocation(currentDropoff);
        setDropoffAddress(currentDropoffAddr);
        setDropoffPlaceId(currentDropoffId);
      }

      if (!currentPickup || !currentDropoff) {
        toast.error("Please enter valid pickup and dropoff locations.");
        return;
      }

      const rideData = {
        pickupLocation: currentPickupAddr || "Current Location",
        dropoffLocation: currentDropoffAddr,
        pickupCoordinates: [currentPickup.lng, currentPickup.lat],
        dropoffCoordinates: [currentDropoff.lng, currentDropoff.lat],
        pickupPlaceId: currentPickupId,
        dropoffPlaceId: currentDropoffId,
        distance,
        pickupType,
        city: currentPickupAddr ? detectCity(currentPickupAddr) : "Lagos",
        scheduleTime: pickupType === "later" ? scheduleTime : null,
      };

      navigate("/ride/selection", { state: { rideData } });
    } catch (error) {
      console.error("Error in handleSeePricing:", error);
      toast.error("Failed to calculate route. Please check your locations.");
    } finally {
      setIsLoading(false);
    }
  };

  const detectCity = (location) => {
    if (!location) return "Lagos";
    const cities = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Akure"];
    return cities.find((city) => location.toLowerCase().includes(city.toLowerCase())) || "Lagos";
  };

  return (
    <div className="bg-white p-8 rounded-lg w-full max-w-6xl mx-auto ">
      <Toaster />
      <h3 className="text-xl font-semibold mb-4">Get your ride</h3>
      <div className="flex flex-col items-center lg:flex-row gap-6">
        <form className="space-y-6 w-full lg:w-1/2" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-4 w-full">
              <input
                id="pickup-input"
                type="text"
                placeholder="Enter pickup location"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="bg-transparent focus:outline-none w-full"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex items-center bg-gray-100 rounded-full px-4 py-4">
            <input
              id="dropoff-input"
              type="text"
              placeholder="Enter dropoff location"
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              className="bg-transparent focus:outline-none w-full"
              autoComplete="off"
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
            onClick={handleSeePricing}
            disabled={isLoading || !isMapsReady}
            className={`w-full py-3 text-lg rounded-full ${
              isMapsReady && !isLoading
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? <DotLoader color="#fff" size={24} /> : "See Pricing"}
          </button>

          {locationError && (
            <p className="mt-2 text-sm text-red-500">{locationError}</p>
          )}
        </form>

        <div
          ref={mapRef}
          className="w-full lg:w-1/2 h-64 lg:h-[250px] xl:h-[350px] rounded-lg"
        ></div>
      </div>
    </div>
  );
};

export default RideForm;
