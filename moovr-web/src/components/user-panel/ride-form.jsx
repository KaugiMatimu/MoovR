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
  const [isResolvingPickupAddress, setIsResolvingPickupAddress] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [pickupAccuracy, setPickupAccuracy] = useState(null);

  const mapRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const pickupManuallyEditedRef = useRef(false);
  const pickupRequestRef = useRef(0);
  const pickupAddressRequestRef = useRef(null);
  const locationWatchRef = useRef(null);
  const locationTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const clearLocationWatch = useCallback(() => {
    if (locationWatchRef.current !== null) {
      navigator.geolocation?.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    if (locationTimeoutRef.current !== null) {
      window.clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearLocationWatch, [clearLocationWatch]);

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
      "premise",
      "subpremise",
      "neighborhood",
      "sublocality_level_1",
      "sublocality_level_2",
      "sublocality",
      "locality",
      "administrative_area_level_1",
    ];

    const valuesByType = new Map();
    addressComponents.forEach((component) => {
      component.types.forEach((type) => {
        if (!valuesByType.has(type)) {
          valuesByType.set(type, component.long_name);
        }
      });
    });

    const parts = preferredTypes
      .map((type) => valuesByType.get(type))
      .filter(Boolean)
      .filter((part, index, allParts) => allParts.findIndex(
        (candidate) => candidate.toLowerCase() === part.toLowerCase()
      ) === index);

    if (parts.length > 0) {
      return parts.join(", ");
    }

    return addressComponents
      .map((component) => component.long_name)
      .filter(Boolean)
      .filter((part, index, allParts) => allParts.findIndex(
        (candidate) => candidate.toLowerCase() === part.toLowerCase()
      ) === index)
      .join(", ");
  }, []);

  const isPlusCodeAddress = (address) => {
    return /^\s*[A-Z0-9]{2,}\+[A-Z0-9]{3,}/.test(address || "");
  };

  const chooseBestGeocoderResult = useCallback((results) => {
    if (!Array.isArray(results) || results.length === 0) return null;

    const precisionScores = {
      street_address: 100,
      premise: 95,
      subpremise: 94,
      route: 90,
      intersection: 85,
      point_of_interest: 80,
      establishment: 80,
      neighborhood: 75,
      sublocality_level_1: 70,
      sublocality: 68,
      locality: 60,
      administrative_area_level_1: 40,
      country: 10,
    };

    const scored = results.map((result) => {
      const types = Array.isArray(result.types) ? result.types : [];
      const score = Math.max(0, ...types.map((type) => precisionScores[type] || 0));

      return { result, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.result ?? results[0];
  }, []);

  const getReadableAddressFromResult = useCallback(
    (result) => {
      if (!result) return "";
      const address = result.formatted_address || "";
      const componentAddress = getFormattedAddress(result.address_components);
      const readable = componentAddress || (
        address && !isPlusCodeAddress(address) ? address : result.name || address
      );
      return readable || "";
    },
    [getFormattedAddress]
  );

  const reverseGeocodeLocation = useCallback((location) => {
    return new Promise((resolve, reject) => {
      if (!window.google?.maps) {
        reject(new Error("Google Maps is not ready"));
        return;
      }

      new window.google.maps.Geocoder().geocode({ location }, (results, status) => {
        if (status === "OK" && results?.length) {
          resolve(chooseBestGeocoderResult(results));
        } else {
          reject(new Error(`Address lookup failed: ${status}`));
        }
      });
    });
  }, [chooseBestGeocoderResult]);

  const updatePickupMarker = useCallback((location) => {
    const google = window.google;
    const map = mapInstanceRef.current;
    if (!google?.maps || !map) return;

    if (!pickupMarkerRef.current) {
      const marker = new google.maps.Marker({
        position: location,
        map,
        draggable: true,
        title: "Pickup location. Drag to adjust.",
      });

      marker.addListener("dragend", async () => {
        const markerPosition = marker.getPosition();
        if (!markerPosition) return;

        const movedLocation = {
          lat: markerPosition.lat(),
          lng: markerPosition.lng(),
        };
        const requestId = ++pickupRequestRef.current;
        pickupManuallyEditedRef.current = true;
        setPickupLocation(movedLocation);
        setPickupAccuracy(null);
        setPickupAddress("Finding address...");
        setIsResolvingPickupAddress(true);
        setLocationError("");

        try {
          const result = await reverseGeocodeLocation(movedLocation);
          if (requestId !== pickupRequestRef.current) return;
          const address = getReadableAddressFromResult(result);
          setPickupAddress(address || "Dropped pin");
          setPickupPlaceId(result?.place_id || null);
        } catch (error) {
          if (requestId !== pickupRequestRef.current) return;
          console.error("Unable to resolve the dropped pickup pin:", error);
          setPickupAddress("Dropped pin");
          setLocationError("We couldn't find a street address for this pin. Your pickup point is still marked on the map.");
        } finally {
          if (requestId === pickupRequestRef.current) {
            setIsResolvingPickupAddress(false);
          }
        }
      });

      pickupMarkerRef.current = marker;
    } else {
      pickupMarkerRef.current.setPosition(location);
      pickupMarkerRef.current.setMap(map);
    }

    map.setCenter(location);
    map.setZoom(17);
  }, [getReadableAddressFromResult, reverseGeocodeLocation]);

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
          clearLocationWatch();
          pickupRequestRef.current += 1;
          pickupManuallyEditedRef.current = true;
          setIsDetectingLocation(false);
          setPickupLocation(location);
          setPickupAddress(formattedAddress);
          setPickupPlaceId(placeId);
          setPickupAccuracy(null);
          setIsResolvingPickupAddress(false);
          updatePickupMarker(location);
        } else {
          setDropoffLocation(location);
          setDropoffAddress(formattedAddress);
          setDropoffPlaceId(placeId);
        }

        if (type === "dropoff") {
          mapInstanceRef.current.setCenter(place.geometry.location);
          mapInstanceRef.current.setZoom(14);
        }
      });
    },
    [clearLocationWatch, getReadableAddressFromResult, updatePickupMarker]
  );

  const fetchCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    clearLocationWatch();
    const requestId = ++pickupRequestRef.current;
    let bestAccuracy = Infinity;
    let bestPosition = null;

    setIsDetectingLocation(true);
    setIsResolvingPickupAddress(false);
    setLocationError("");
    setPickupLocation(null);
    setPickupAddress("");
    setPickupPlaceId(null);
    setPickupAccuracy(null);
    pickupAddressRequestRef.current = null;
    pickupMarkerRef.current?.setMap(null);

    const stopWatching = () => {
      if (locationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
        locationWatchRef.current = null;
      }
      if (locationTimeoutRef.current !== null) {
        window.clearTimeout(locationTimeoutRef.current);
        locationTimeoutRef.current = null;
      }
    };

    const rejectLocation = (message) => {
      if (requestId !== pickupRequestRef.current) return;
      stopWatching();
      setIsDetectingLocation(false);
      setPickupAccuracy(Number.isFinite(bestAccuracy) ? Math.round(bestAccuracy) : null);
      setLocationError(message);
    };

    const acceptLocation = (position, accuracy) => {
      if (requestId !== pickupRequestRef.current || pickupManuallyEditedRef.current) return;
      stopWatching();
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setPickupLocation(location);
      setPickupAddress("Current Location");
      setPickupPlaceId(null);
      setPickupAccuracy(Math.round(accuracy));
      setIsDetectingLocation(false);
      if (accuracy > 100) {
        setLocationError(`Using the best GPS fix available (about ±${Math.round(accuracy)} m). Adjust the map pin to confirm your exact pickup point.`);
      } else {
        setLocationError("");
      }
    };

    const onPosition = (position) => {
      if (requestId !== pickupRequestRef.current || pickupManuallyEditedRef.current) return;
      const accuracy = position.coords.accuracy;
      if (!Number.isFinite(accuracy) || accuracy <= 0) return;

      if (accuracy < bestAccuracy) {
        bestAccuracy = accuracy;
        bestPosition = position;
        setPickupAccuracy(Math.round(accuracy));
      }
      if (accuracy <= 50) {
        acceptLocation(position, accuracy);
      }
    };

    const onPositionError = (error) => {
      if (requestId !== pickupRequestRef.current) return;

      if (error.code === error.PERMISSION_DENIED) {
        rejectLocation("Location access was denied. Enable precise location permission in your browser, or enter your pickup manually.");
      } else if (bestPosition && bestAccuracy <= 250) {
        acceptLocation(bestPosition, bestAccuracy);
      } else if (Number.isFinite(bestAccuracy)) {
        rejectLocation(
          `GPS is only accurate to about ±${Math.round(bestAccuracy)} m. Please try again or enter your pickup manually.`
        );
      } else {
        rejectLocation("Couldn't get a GPS fix. Check that location is enabled, then try again or enter your pickup manually.");
      }
    };

    try {
      locationWatchRef.current = navigator.geolocation.watchPosition(
        onPosition,
        onPositionError,
        { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 }
      );
      locationTimeoutRef.current = window.setTimeout(() => {
        if (requestId !== pickupRequestRef.current) return;
        if (bestPosition && bestAccuracy <= 250) {
          acceptLocation(bestPosition, bestAccuracy);
        } else if (Number.isFinite(bestAccuracy)) {
          rejectLocation(
            `GPS is only accurate to about ±${Math.round(bestAccuracy)} m, so we didn't set it as your pickup. Enable precise location or enter your pickup manually.`
          );
        } else {
          rejectLocation("Couldn't get a GPS fix. Enable precise location or enter your pickup manually.");
        }
      }, 30000);
    } catch (error) {
      console.error("Unable to start GPS location tracking:", error);
      rejectLocation("Couldn't start location detection. Enable precise location or enter your pickup manually.");
    }
  }, [clearLocationWatch]);

  const initializeMap = useCallback(() => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps was not loaded properly.");
      return;
    }

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 6.5244, lng: 3.3792 },
      zoom: 13,
    });

    directionsServiceRef.current = new window.google.maps.DirectionsService();
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer();
    directionsRendererRef.current.setMap(mapInstanceRef.current);

    initializeAutocomplete("pickup");
    initializeAutocomplete("dropoff");

    setIsMapsReady(true);
  }, [initializeAutocomplete]);

  useEffect(() => {
    fetchCurrentLocation();
    loadGoogleMapsScript()
      .then(initializeMap)
      .catch(() => toast.error("Failed to load Google Maps script."));
  }, [fetchCurrentLocation, initializeMap, loadGoogleMapsScript]);

  useEffect(() => {
    if (!isMapsReady || !pickupLocation) return;

    updatePickupMarker(pickupLocation);
    if (pickupManuallyEditedRef.current) return;

    const locationKey = `${pickupLocation.lat},${pickupLocation.lng}`;
    if (pickupAddressRequestRef.current === locationKey) return;
    pickupAddressRequestRef.current = locationKey;

    const requestId = pickupRequestRef.current;
    setIsResolvingPickupAddress(true);
    reverseGeocodeLocation(pickupLocation)
      .then((result) => {
        if (requestId !== pickupRequestRef.current || pickupManuallyEditedRef.current) return;
        setPickupAddress(getReadableAddressFromResult(result) || "Current Location");
        setPickupPlaceId(result?.place_id || null);
      })
      .catch((error) => {
        if (requestId !== pickupRequestRef.current) return;
        console.error("Unable to resolve the current pickup location:", error);
        if (!pickupManuallyEditedRef.current) {
          setPickupAddress("Current Location");
          setLocationError("We couldn't find a street address. Your pickup pin is marked on the map; drag it to adjust the meeting point.");
        }
      })
      .finally(() => {
        if (requestId === pickupRequestRef.current) {
          setIsResolvingPickupAddress(false);
        }
      });
  }, [
    getReadableAddressFromResult,
    isMapsReady,
    pickupLocation,
    reverseGeocodeLocation,
    updatePickupMarker,
  ]);

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
        updatePickupMarker(currentPickup);
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
                placeholder={isDetectingLocation ? "Finding your pickup location..." : "Enter or confirm pickup location"}
                value={pickupAddress}
                onChange={(e) => {
                  clearLocationWatch();
                  pickupManuallyEditedRef.current = true;
                  setIsDetectingLocation(false);
                  setPickupAddress(e.target.value);
                  setPickupLocation(null);
                  setPickupPlaceId(null);
                  setPickupAccuracy(null);
                  pickupRequestRef.current += 1;
                  setIsResolvingPickupAddress(false);
                  setLocationError("");
                  pickupMarkerRef.current?.setMap(null);
                }}
                className="bg-transparent focus:outline-none w-full"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-gray-600" aria-live="polite">
              {isDetectingLocation
                ? pickupAccuracy !== null
                  ? `Getting your location... best GPS accuracy ±${pickupAccuracy} m`
                  : "Searching for a precise GPS fix..."
                : isResolvingPickupAddress
                  ? "Finding the pickup address..."
                  : pickupLocation && pickupAccuracy !== null
                    ? `Current location · GPS accuracy about ±${pickupAccuracy} m`
                    : pickupAccuracy !== null
                      ? `GPS fix is only accurate to about ±${pickupAccuracy} m`
                    : pickupLocation
                      ? "Pickup point set · drag the map pin to adjust"
                      : "Choose an address or use your current location"}
            </span>
            <button
              type="button"
              onClick={() => {
                pickupRequestRef.current += 1;
                pickupManuallyEditedRef.current = false;
                setIsResolvingPickupAddress(false);
                fetchCurrentLocation();
              }}
              disabled={isDetectingLocation || isResolvingPickupAddress}
              className="font-medium text-purple-700 hover:text-purple-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDetectingLocation ? "Locating..." : "Use my current location"}
            </button>
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
            disabled={isLoading || !isMapsReady || isDetectingLocation || isResolvingPickupAddress}
            className={`w-full py-3 text-lg rounded-full ${
              isMapsReady && !isLoading && !isDetectingLocation && !isResolvingPickupAddress
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? <DotLoader color="#fff" size={24} /> : "See Pricing"}
          </button>

          {locationError && (
            <p className="mt-2 text-sm text-amber-700" role="status">{locationError}</p>
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
