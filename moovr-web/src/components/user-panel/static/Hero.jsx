import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useLanguage } from "../../../context/LanguageContext.jsx";

const HeroSection = () => {
  const { t } = useLanguage();
  const [pickupInput, setPickupInput] = useState("");
  const [dropoffInput, setDropoffInput] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [isMapsReady, setIsMapsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const pickupInputRef = useRef(null);
  const dropoffInputRef = useRef(null);

  const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }
      const existingScript = document.getElementById("googleMapsScript");
      if (existingScript) {
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
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
  };

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        initializeAutocomplete();
        fetchCurrentLocation();
      })
      .catch((error) => {
        console.error("Failed to load Google Maps script:", error);
        setIsMapsReady(true); // Still allow manual entry
      });
  }, []);

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
              if (results[0]) {
                const addr = results[0].formatted_address;
                setPickupLocation(pos);
                setPickupAddress(addr);
                setPickupInput(addr);
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

  const initializeAutocomplete = () => {
    const google = window.google;
    if (!google || !google.maps || !google.maps.places) return;

    if (pickupInputRef.current) {
      const pickupAutocomplete = new google.maps.places.Autocomplete(pickupInputRef.current);
      pickupAutocomplete.addListener("place_changed", () => {
        const place = pickupAutocomplete.getPlace();
        if (!place.geometry) return;
        setPickupLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        const addr = place.formatted_address || place.name || "";
        setPickupAddress(addr);
        setPickupInput(addr);
      });
    }

    if (dropoffInputRef.current) {
      const dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffInputRef.current);
      dropoffAutocomplete.addListener("place_changed", () => {
        const place = dropoffAutocomplete.getPlace();
        if (!place.geometry) return;
        setDropoffLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        const addr = place.formatted_address || place.name || "";
        setDropoffAddress(addr);
        setDropoffInput(addr);
      });
    }

    setIsMapsReady(true);
  };

  const geocodeAddress = (address) => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) {
        reject("Google Maps not loaded");
        return;
      }
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK") {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
            formatted_address: results[0].formatted_address,
          });
        } else {
          reject(status);
        }
      });
    });
  };

  const detectCity = (location) => {
    if (!location) return "Lagos";
    const cities = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Akure"];
    for (const c of cities) {
      if (location.toLowerCase().includes(c.toLowerCase())) {
        return c;
      }
    }
    return "Lagos";
  };

  const handleSeePricing = async () => {
    if (!pickupInput || !dropoffInput) {
      toast.error("Please enter both pickup and destination locations.");
      return;
    }

    setIsLoading(true);
    let currentPickupLocation = pickupLocation;
    let currentDropoffLocation = dropoffLocation;
    let currentPickupAddress = pickupAddress || pickupInput;
    let currentDropoffAddress = dropoffAddress || dropoffInput;

    try {
      if (!window.google || !window.google.maps) {
        throw new Error("Google Maps is not available yet.");
      }

      if (!currentPickupLocation) {
        const res = await geocodeAddress(pickupInput);
        currentPickupLocation = { lat: res.lat, lng: res.lng };
        currentPickupAddress = res.formatted_address;
      }

      if (!currentDropoffLocation) {
        const res = await geocodeAddress(dropoffInput);
        currentDropoffLocation = { lat: res.lat, lng: res.lng };
        currentDropoffAddress = res.formatted_address;
      }

      const directionsService = new window.google.maps.DirectionsService();
      const result = await new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: currentPickupLocation,
            destination: currentDropoffLocation,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (res, status) => {
            if (status === "OK") resolve(res);
            else reject(status);
          }
        );
      });

      const route = result.routes[0];
      const distanceInKm = route.legs[0].distance.value / 1000;
      const city = detectCity(currentPickupAddress);

      const rideData = {
        pickupLocation: currentPickupAddress,
        dropoffLocation: currentDropoffAddress,
        pickupCoordinates: [currentPickupLocation.lng, currentPickupLocation.lat],
        dropoffCoordinates: [currentDropoffLocation.lng, currentDropoffLocation.lat],
        distance: distanceInKm,
        pickupType: "now",
        city,
        scheduleTime: null,
      };

      navigate("/ride/selection", { state: { rideData } });
    } catch (error) {
      console.error("Error in pricing flow:", error);
      toast.error(error.message || "Failed to calculate route. Please check your locations.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-12 justify-between items-center px-8 py-16 md:py-24 ">
      <Toaster />
      {/* Left Side - Text & Form */}
      <div className=" space-y-6 text-start">
        <h1 className="text-4xl font-bold text-gray-900">
          {t("rideSmartArriveHappy")}
        </h1>
        <p className="text-gray-500">
          {t("addJourneyDetails")}
        </p>
        {/* Input Fields */}
        <div className="relative space-y-4 max-w-xs">
          <input
            ref={pickupInputRef}
            id="hero-pickup-input"
            type="text"
            value={pickupInput}
            onChange={(e) => {
              setPickupInput(e.target.value);
              setPickupLocation(null);
            }}
            placeholder={t("enterPickupLocation")}
            className="relative w-full px-4 py-3 bg-gray-100 rounded-full border border-gray-300 focus:outline-none"
          />
          <input
            ref={dropoffInputRef}
            id="hero-dropoff-input"
            type="text"
            value={dropoffInput}
            onChange={(e) => {
              setDropoffInput(e.target.value);
              setDropoffLocation(null);
            }}
            placeholder={t("enterDestination")}
            className="relative w-full px-4 py-3 bg-gray-100 rounded-full border border-gray-300 focus:outline-none"
          />
        </div>

        {/* CTA Button */}
        <button 
          onClick={handleSeePricing}
          disabled={isLoading}
          className="bg-purple-500 text-white py-3 px-14 rounded-full font-medium hover:bg-purple-600 disabled:bg-gray-400"
        >
          {isLoading ? t("calculating") : t("seePricing")}
        </button>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:block">
        <img
          src="/images/hero-section-img.png"
          alt="Woman with luggage"
          className="w-full max-w-lg"
        />
      </div>
    </div>
  );
};

export default HeroSection;
