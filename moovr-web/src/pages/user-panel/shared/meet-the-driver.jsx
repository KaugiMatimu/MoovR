import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../../../components/user-panel/header"; // Import your Header component
import DriverInfoCard from "../../../components/user-panel/driver-info-card"; // Import the new DriverInfoCard component
import { BaseURL } from "../../../utils/BaseURL";
import usePreventLeave from "../../../hooks/usePreventLeave";
import { useSocket } from "../../../context/LocationProvider";

const MeetDriverScreen = () => {
  const { socket, joinRideRoom } = useSocket();
  const location = useLocation();
  const [ride, setRide] = useState(location.state?.ride || null);
  const [loading, setLoading] = useState(Boolean(location.state?.ride) ? false : true);
  const [targetIdentifier, setTargetIdentifier] = useState("");
  const [shareTargetUserId, setShareTargetUserId] = useState(null);
  const [shareMessage, setShareMessage] = useState("");
  const [isSharingActive, setIsSharingActive] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showNavigation, setShowNavigation] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const directionsRendererRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeSteps, setRouteSteps] = useState([]);
  const normalizeId = (id) => {
    if (!id) return null;
    if (typeof id === "string") return id.trim();
    try {
      return id.toString().trim();
    } catch {
      return null;
    }
  };

  const rideId = normalizeId(
    location.state?.rideId || location.state?.ride?._id || location.state?.ride?.id || new URLSearchParams(location.search).get("rideId")
  );
  const normalizedRideId = rideId;
  const hasValidRideId = Boolean(normalizedRideId && /^[a-f0-9]{24}$/i.test(normalizedRideId));
  const shouldShareLocation = Boolean(hasValidRideId && ["accepted", "running", "arrived"].includes(ride?.status));

  const getStoredShareTarget = (currentRideId) => {
    if (!currentRideId) return null;
    const stored = localStorage.getItem(`liveShareTarget_${currentRideId}`);
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  };

  const persistShareTarget = (currentRideId, userId, identifier) => {
    if (!currentRideId) return;
    localStorage.setItem(`liveShareTarget_${currentRideId}`, JSON.stringify({ userId, identifier }));
  };

  usePreventLeave(true);

  useEffect(() => {
    const fetchRide = async () => {
      if (ride || !hasValidRideId) {
        if (!hasValidRideId) {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BaseURL}/rides/status/${normalizedRideId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.ride) {
          setRide(response.data.ride);
        }
      } catch (error) {
        console.error("Unable to fetch ride for meet screen:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [ride, hasValidRideId, normalizedRideId]);

  useEffect(() => {
    if (!socket || !hasValidRideId) return;
    joinRideRoom(normalizedRideId);

    if (["accepted", "running", "arrived"].includes(ride?.status)) {
      setShowNavigation(true);
    }

    const handleRideStatus = (data) => {
      if (!data || data._id?.toString() !== normalizedRideId) return;
      setRide(data);
      if (["accepted", "running", "arrived"].includes(data.status)) {
        setShowNavigation(true);
      }
    };

    const handleRideAccepted = (data) => {
      if (!data || data._id?.toString() !== normalizedRideId) return;
      setRide(data);
      setShowNavigation(true);
    };

    const handleDriverLocation = (payload) => {
      if (!payload || payload.rideId?.toString() !== normalizedRideId) return;
      if (payload.coordinates && Array.isArray(payload.coordinates)) {
        setDriverLocation(payload.coordinates);
        if (!showNavigation) {
          setShowNavigation(true);
        }
      }
    };

    socket.on("rideAccepted", handleRideAccepted);
    socket.on("rideStatusUpdated", handleRideStatus);
    socket.on("driverLocationUpdate", handleDriverLocation);

    return () => {
      socket.off("rideAccepted", handleRideAccepted);
      socket.off("rideStatusUpdated", handleRideStatus);
      socket.off("driverLocationUpdate", handleDriverLocation);
    };
  }, [socket, hasValidRideId, normalizedRideId, joinRideRoom, ride]);

  useEffect(() => {
    if (!hasValidRideId) return;
    const storedTarget = getStoredShareTarget(normalizedRideId);
    if (storedTarget?.userId) {
      setShareTargetUserId(storedTarget.userId);
      if (storedTarget.identifier) {
        setTargetIdentifier(storedTarget.identifier);
      }
    }
  }, [hasValidRideId, normalizedRideId]);

  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) return resolve();
      const existing = document.getElementById("googleMapsScript");
      if (existing) {
        existing.onload = resolve;
        return;
      }
      const script = document.createElement("script");
      script.id = "googleMapsScript";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Google Maps failed to load"));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    if (!showNavigation) return;
    // initialize map and directions renderer
    loadGoogleMaps()
      .then(() => {
        const google = window.google;
        if (!mapRef.current) return;
        const pickup = (() => {
          if (!ride?.pickupCoordinates) return { lat: 6.5244, lng: 3.3792 };
          const c = Array.isArray(ride.pickupCoordinates) ? ride.pickupCoordinates : ride.pickupCoordinates.coordinates;
          return { lat: c[1], lng: c[0] };
        })();
        mapInstance.current = new google.maps.Map(mapRef.current, { center: pickup, zoom: 14, disableDefaultUI: true });

        if (!directionsRendererRef.current) {
          directionsRendererRef.current = new google.maps.DirectionsRenderer({ suppressMarkers: true, preserveViewport: true });
          directionsRendererRef.current.setMap(mapInstance.current);
        }
        if (!directionsServiceRef.current) directionsServiceRef.current = new google.maps.DirectionsService();
      })
      .catch((err) => console.error(err));
  }, [showNavigation, ride]);

  useEffect(() => {
    if (!showNavigation || !driverLocation || !mapInstance.current || !directionsServiceRef.current) return;
    const google = window.google;
    const origin = { lat: driverLocation[1], lng: driverLocation[0] };
    const destArr = Array.isArray(ride.pickupCoordinates) ? ride.pickupCoordinates : ride.pickupCoordinates?.coordinates;
    if (!destArr) return;
    const destination = { lat: destArr[1], lng: destArr[0] };
    directionsServiceRef.current.route({ origin, destination, travelMode: google.maps.TravelMode.DRIVING }, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK || status === "OK") {
        directionsRendererRef.current.setDirections(result);
        const leg = result.routes?.[0]?.legs?.[0];
        if (leg) {
          setRouteInfo({ distance: leg.distance?.text, duration: leg.duration?.text });
          setRouteSteps(leg.steps.map((s, i) => ({ instruction: s.instructions, distance: s.distance?.text, duration: s.duration?.text, key: `s-${i}` })));
        }
      }
    });
  }, [showNavigation, driverLocation, ride]);

  const shareLiveLocation = async (identifier = targetIdentifier.trim()) => {
    if (!identifier || !hasValidRideId || !navigator.geolocation) {
      setShareMessage("Enter a phone, email, or user ID to share your trip.");
      return null;
    }

    try {
      const token = localStorage.getItem("token");
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      });

      const { latitude, longitude } = position.coords;
      const response = await fetch(`${BaseURL}/auth/share-live-location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetIdentifier: identifier, rideId: normalizedRideId, latitude, longitude }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to share live location");

      const targetUserId = data.userId;
      persistShareTarget(normalizedRideId, targetUserId, identifier);
      setShareTargetUserId(targetUserId);
      setIsSharingActive(true);

      const generatedShareUrl = `${window.location.origin}/live-location/${targetUserId}?rideId=${normalizedRideId}`;
      setShareUrl(generatedShareUrl);

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(generatedShareUrl);
      }

      setShareMessage(`Live tracking link ready for ${data.user?.firstName || identifier}. Link copied to clipboard.`);
      window.open(generatedShareUrl, "_blank", "noopener,noreferrer");
      return generatedShareUrl;
    } catch (error) {
      console.error("Error sharing live passenger location:", error);
      setShareMessage(error.message || "Unable to share your live location right now.");
      return null;
    }
  };

  const handleShareLiveLocation = async () => {
    await shareLiveLocation(targetIdentifier.trim());
  };

  useEffect(() => {
    if (!hasValidRideId || !shouldShareLocation || !navigator.geolocation) return;

    const storedTarget = getStoredShareTarget(normalizedRideId);
    if (storedTarget?.userId) {
      setShareTargetUserId(storedTarget.userId);
      const generatedShareUrl = `${window.location.origin}/live-location/${storedTarget.userId}?rideId=${normalizedRideId}`;
      setShareUrl(generatedShareUrl);
      setIsSharingActive(true);
    } else if (!shareTargetUserId && !shareUrl) {
      shareLiveLocation(storedTarget?.identifier || targetIdentifier.trim());
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const token = localStorage.getItem("token");
          if (!token) return;

          await fetch(`${BaseURL}/auth/update-passenger-location`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ latitude, longitude, rideId: normalizedRideId, targetUserId: shareTargetUserId || getStoredShareTarget(normalizedRideId)?.userId }),
          });
        } catch (error) {
          console.error("Error sharing live passenger location:", error);
        }
      },
      (error) => {
        console.error("Passenger location watch error:", error);
      },
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [hasValidRideId, normalizedRideId, shouldShareLocation, shareTargetUserId]);

  return (
    <div className="h-screen w-screen">
      {/* Header */}
      <Header disableNavigation />

      {/* Main Content */}
      <div className="relative h-full">
        {/* Map Background */}
        <div className="absolute inset-0 ">
          <img
            title="Map"
            src="/images/full-map-img.png"
            className="w-full h-full"
            alt="map"
          />
        </div>

        {/* Floating Driver Info / Inline Navigation Panel */}
        <div className="absolute top-[10%] left-[10%]  flex flex-col items-center space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-6 w-[350px] text-center">
              <p className="text-gray-700">Loading driver details...</p>
            </div>
          ) : showNavigation ? (
            <div className="w-[380px] rounded-2xl bg-white/95 p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Driver is on the way</p>
                  <p className="mt-1 text-xs text-slate-500">Live navigation to your pickup point.</p>
                </div>
                {routeInfo?.distance && routeInfo?.duration ? (
                  <div className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1 rounded-full">
                    {routeInfo.distance} • {routeInfo.duration}
                  </div>
                ) : null}
              </div>

              <div ref={mapRef} className="mt-3 h-40 w-full rounded-lg overflow-hidden" />

              {routeSteps.length > 0 ? (
                <div className="mt-3 max-h-44 overflow-auto text-left text-sm text-slate-700 space-y-2">
                  {routeSteps.map((step, idx) => (
                    <div key={step.key} className="rounded-lg bg-slate-50 p-2">
                      <p className="font-medium">Step {idx + 1}</p>
                      <p className="text-xs mt-1" dangerouslySetInnerHTML={{ __html: step.instruction }} />
                      <p className="text-[11px] text-slate-500">{step.distance} · {step.duration}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500">Waiting for driver location…</p>
              )}
            </div>
          ) : (
            <>
              <DriverInfoCard ride={ride} disableStatusRedirect />

              <div className="w-[350px] rounded-2xl bg-white/95 p-4 shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">Share your live trip location</p>
                  <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${isSharingActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                    <span className={`h-2 w-2 rounded-full ${isSharingActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                    {isSharingActive ? "Sharing active" : "Standby"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Create and copy a live tracking link for a trusted person during the ride.</p>
                <div className="mt-3 flex gap-2">
                  <input
                    value={targetIdentifier}
                    onChange={(e) => setTargetIdentifier(e.target.value)}
                    placeholder="Phone, email, or user ID"
                    className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm outline-none"
                  />
                  <button
                    onClick={handleShareLiveLocation}
                    className="rounded-full bg-primaryPurple px-4 py-2 text-sm font-semibold text-white"
                  >
                    Share Link
                  </button>
                </div>
                {shareMessage ? <p className="mt-2 text-xs text-slate-600">{shareMessage}</p> : null}
                {shareUrl ? (
                  <p className="mt-2 break-all text-[11px] text-primaryPurple">{shareUrl}</p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetDriverScreen;
