import React, { useState, useRef, useEffect } from "react";
import Header from "../../../components/user-panel/header"; // Import your Header component
import { FaArrowLeft } from "react-icons/fa"; // For the map marker icon
import { IoSearch } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const ConfirmDelivery = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // const { pickupLocation, pickupAddress } = location.state;
  const { pickupLocation, pickupAddress } = location.state || {};

  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isMapsReady, setIsMapsReady] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const deliveryMarkerRef = useRef(null);

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
        disableDefaultUI: true, // Disable default UI controls
      });

      directionsServiceRef.current = new google.maps.DirectionsService();
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // Suppress default markers
      });
      directionsRendererRef.current.setMap(mapInstance.current);

      // Add pickup marker
      pickupMarkerRef.current = new google.maps.Marker({
        position: pickupLocation,
        map: mapInstance.current,
        label: "P",
      });

      initializeAutocomplete("delivery");

      setIsMapsReady(true);
    };

    const initializeAutocomplete = (type) => {
      const input = document.getElementById(`${type}-input`);
      const autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.bindTo("bounds", mapInstance.current);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        setDeliveryLocation(location);
        setDeliveryAddress(place.formatted_address || "");

        mapInstance.current.setCenter(place.geometry.location);
        mapInstance.current.setZoom(14);

        // Add delivery marker
        if (deliveryMarkerRef.current) {
          deliveryMarkerRef.current.setMap(null);
        }
        deliveryMarkerRef.current = new google.maps.Marker({
          position: location,
          map: mapInstance.current,
          label: "D",
        });

        // Display route from pickup to delivery
        calculateAndDisplayRoute(pickupLocation, location);
      });
    };

    const calculateAndDisplayRoute = (origin, destination) => {
      const directionsService = directionsServiceRef.current;
      const directionsRenderer = directionsRendererRef.current;

      if (!directionsService || !directionsRenderer) {
        console.error("Google Maps services not initialized yet.");
        return;
      }

      directionsService.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            directionsRenderer.setDirections(result);

            // Align markers with the route
            const leg = result.routes[0].legs[0];
            pickupMarkerRef.current.setPosition(leg.start_location);
            deliveryMarkerRef.current.setPosition(leg.end_location);
          } else {
            console.error(`Directions request failed due to ${status}`);
          }
        }
      );
    };

    loadGoogleMapsScript();
  }, [pickupLocation]);

  useEffect(() => {
  if (!pickupLocation) {
    toast.error("Pickup location not found. Redirecting...");
    navigate("/package/pickup");
    return;
  }

  // continue loading map script...
}, [pickupLocation, navigate]);

  const handleConfirmDelivery = () => {
    if (!deliveryLocation) {
      toast.error("Please select a valid delivery location.");
      return;
    }

    // Navigate to the selection page with the selected locations
    navigate("/package/selection", {
      state: {
        pickupLocation,
        deliveryLocation,
        pickupAddress,
        deliveryAddress,
      },
    });
  };

  return (
    <div className="h-screen w-screen">
      <Toaster />
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="relative h-full">
        {/* Map Background */}
        <div className="absolute inset-0">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Floating Card for Delivery Selection */}
        <div className="absolute top-[10%] left-[10%] transform md:w-[400px]  space-y-4 w-[80%] ">
          {/* Search Input */}

          {/* Back Button */}
          <Link
            to={"/package/pickup"}
            className="flex items-center mb-20 cursor-pointer"
          >
            <FaArrowLeft className="text-lg mr-2" />
           
          </Link>
          <div className="relative mb-4">
            <IoSearch
              className="absolute top-1/2 transform -translate-y-1/2 left-4 text-gray-600"
              size={20}
            />
            <input
              id="delivery-input"
              type="text"
              placeholder="Select delivery point"
              className="w-full pl-12 px-6 py-4 border rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className=" p-4 md:p-7 bg-white rounded-lg shadow-lg">
            <div className=" text-lg font-semibold">Choose Delivery point</div>

            {/* Instruction Text */}
            <div className="text-sm text-start text-gray-500 my-2 pb-4">
              Drag map to adjust
            </div>

            {/* Confirm Button */}
            <div className="w-full flex">
              <button
                onClick={handleConfirmDelivery}
                className="w-full text-center py-3 rounded-full bg-purple-500 text-white font-semibold hover:bg-purple-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDelivery;
