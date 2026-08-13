import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import toast, { Toaster } from "react-hot-toast";

const markerIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const RecenterMap = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], 13);
    }
  }, [location, map]);

  return null;
};

RecenterMap.propTypes = {
  location: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
};

const parseCoordinates = (value) => {
  const [lat, lng] = value
    .split(",")
    .map((coord) => parseFloat(coord.trim()));

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return { lat, lng };
};

const RideForm = () => {
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [pickupInput, setPickupInput] = useState("");
  const [dropoffInput, setDropoffInput] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const watchIdRef = useRef(null);
  const navigate = useNavigate();

  const handleGeolocationError = useCallback((error) => {
    console.error("Geolocation error:", error);
    if (error.code === error.TIMEOUT) {
      toast.error("Location request timed out. Please refresh or try again.");
    } else if (error.code === error.PERMISSION_DENIED) {
      toast.error("Location permission denied. Please allow location access.");
    } else {
      toast.error("Unable to detect your current location. Please enter it manually.");
    }
    setIsDetecting(false);
  }, []);

  const setCurrentLocation = useCallback((position) => {
    const location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    setPickupLocation(location);
    setPickupInput(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
    setIsDetecting(false);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      setCurrentLocation,
      (error) => {
        handleGeolocationError(error);

        if (navigator.geolocation && watchIdRef.current === null) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            setCurrentLocation,
            handleGeolocationError,
            {
              enableHighAccuracy: true,
              timeout: 30000,
              maximumAge: 0,
            }
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    );

    return () => {
      if (navigator.geolocation && watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [handleGeolocationError, setCurrentLocation]);

  const updateLocation = (value, type) => {
    if (type === "pickup") {
      setPickupInput(value);
      setPickupLocation(parseCoordinates(value));
    } else {
      setDropoffInput(value);
      setDropoffLocation(parseCoordinates(value));
    }
  };


  const handleSeePricing = (e) => {
    e.preventDefault();

    if (!pickupLocation) {
      toast.error("Enter a valid pickup location in latitude, longitude format.");
      return;
    }

    if (!dropoffLocation) {
      toast.error("Enter a valid dropoff location in latitude, longitude format.");
      return;
    }

    setIsSubmitting(true);
    const rideData = {
      pickupLocation: pickupInput,
      dropoffLocation: dropoffInput,
      pickupCoordinates: [pickupLocation.lng, pickupLocation.lat],
      dropoffCoordinates: [dropoffLocation.lng, dropoffLocation.lat],
      distance: null,
    };

    navigate("/ride/selection", { state: { rideData } });
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-8 rounded-lg w-full max-w-lg mx-auto mt-8">
      <Toaster />
      <h3 className="text-xl font-semibold mb-4">Get your ride</h3>
      <form className="space-y-6" onSubmit={handleSeePricing}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-4 w-full">
            <input
              type="text"
              placeholder="Pickup coordinates (e.g., 6.524379, 3.379206)"
              value={pickupInput}
              onChange={(e) => updateLocation(e.target.value, "pickup")}
              className="bg-transparent focus:outline-none w-full"
              autoComplete="off"
            />
          </div>
          {isDetecting && (
            <p className="text-sm text-gray-500">Detecting your current location automatically…</p>
          )}
        </div>

        <div className="flex items-center bg-gray-100 rounded-full px-4 py-4">
          <input
            type="text"
            placeholder="Dropoff coordinates (e.g., 6.524800, 3.380000)"
            value={dropoffInput}
            onChange={(e) => updateLocation(e.target.value, "dropoff")}
            className="bg-transparent focus:outline-none w-full"
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-full text-lg ${isSubmitting ? "bg-gray-300 text-gray-500" : "bg-purple-500 text-white hover:bg-purple-600"}`}
        >
          {isSubmitting ? "Loading..." : "See Pricing"}
        </button>
      </form>

      <div className="w-full h-64 mt-6 rounded-lg overflow-hidden">
        <MapContainer
          center={pickupLocation ? [pickupLocation.lat, pickupLocation.lng] : [6.5244, 3.3792]}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          {pickupLocation && <RecenterMap location={pickupLocation} />}
          {pickupLocation && (
            <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={markerIcon}>
              <Popup>Pickup Location</Popup>
            </Marker>
          )}
          {dropoffLocation && (
            <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={markerIcon}>
              <Popup>Dropoff Location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default RideForm;
