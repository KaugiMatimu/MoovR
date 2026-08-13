import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/LocationProvider";
import axios from "axios";
import { BaseURL } from "../../utils/BaseURL";
import toast from "react-hot-toast";

const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve();
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
    script.onerror = () => reject(new Error("Google Maps load error"));
    document.head.appendChild(script);
  });
};

const RideShare = () => {
  const { token } = useParams();
  const { socket, joinRideRoom } = useSocket();
  const [ride, setRide] = useState(null);
  const [coords, setCoords] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const driverMarkerRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const longPressTimeout = useRef(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activating, setActivating] = useState(false);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [routeSteps, setRouteSteps] = useState([]);

  useEffect(() => {
    const fetchSharedRide = async () => {
      try {
        const res = await axios.get(`${BaseURL}/rides/share/public/${token}`);
        setRide(res.data.ride);
        if (res.data.ride && joinRideRoom) {
          joinRideRoom(res.data.ride._id);
        }
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Invalid or expired share link");
      }
    };

    if (token) fetchSharedRide();
  }, [token, joinRideRoom]);

  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      if (!data) return;
      // data: { driverId, coordinates, rideId }
      if (ride && data.rideId && data.rideId !== ride._id) return;
      if (data.coordinates) {
        setCoords({ lat: data.coordinates[1], lng: data.coordinates[0] });
      }
    };

    socket.on("driverLocationUpdate", handler);
    return () => {
      socket.off("driverLocationUpdate", handler);
    };
  }, [socket, ride]);

  useEffect(() => {
    const initMap = async () => {
      try {
        await loadGoogleMapsScript();
        if (!mapRef.current) return;
        const google = window.google;
        const center = coords ? { lat: coords.lat, lng: coords.lng } : (ride?.pickupCoordinates && ride.pickupCoordinates.coordinates ? { lat: ride.pickupCoordinates.coordinates[1], lng: ride.pickupCoordinates.coordinates[0] } : { lat: 6.5244, lng: 3.3792 });
        mapInstance.current = new google.maps.Map(mapRef.current, { center, zoom: 14, disableDefaultUI: true });
        // pickup marker
        if (ride?.pickupCoordinates && ride.pickupCoordinates.coordinates) {
          const p = { lat: ride.pickupCoordinates.coordinates[1], lng: ride.pickupCoordinates.coordinates[0] };
          pickupMarkerRef.current = new google.maps.Marker({ position: p, map: mapInstance.current, title: "Pickup", icon: { url: "/icons/pickup-pin.svg", scaledSize: new google.maps.Size(36,36) } });
        }
        if (coords) {
          driverMarkerRef.current = new google.maps.Marker({ position: center, map: mapInstance.current, title: "Driver", icon: { url: "/icons/driver-pin.svg", scaledSize: new google.maps.Size(36,36) } });
        }
        // draw initial route if both exist using DirectionsService (turn-by-turn)
        if (google && pickupMarkerRef.current && driverMarkerRef.current) {
          directionsServiceRef.current = new google.maps.DirectionsService();
          directionsRendererRef.current = new google.maps.DirectionsRenderer({ suppressMarkers: true, preserveViewport: true });
          directionsRendererRef.current.setMap(mapInstance.current);
          const origin = driverMarkerRef.current.getPosition();
          const destination = pickupMarkerRef.current.getPosition();
          directionsServiceRef.current.route({ origin, destination, travelMode: google.maps.TravelMode.DRIVING }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK || status === 'OK') {
              directionsRendererRef.current.setDirections(result);
              const steps = [];
              const legs = result.routes?.[0]?.legs || [];
              legs.forEach((leg) => {
                leg.steps.forEach((s) => steps.push({ instruction: s.instructions, distance: s.distance?.text, duration: s.duration?.text }));
              });
              setRouteSteps(steps);
            }
          });
        }
      } catch (err) {
        console.error("Map init error:", err);
      }
    };

    if (ride) initMap();
  }, [ride]);

  useEffect(() => {
    if (!mapInstance.current || !coords) return;
    const google = window.google;
    const pos = { lat: coords.lat, lng: coords.lng };
    mapInstance.current.setCenter(pos);
    if (!driverMarkerRef.current) {
      driverMarkerRef.current = new google.maps.Marker({ position: pos, map: mapInstance.current, title: "Driver" });
    } else {
      driverMarkerRef.current.setPosition(pos);
    }
    // update route with DirectionsService for turn-by-turn steps
    try {
      if (pickupMarkerRef.current) {
        const pPos = pickupMarkerRef.current.getPosition();
        const dPos = driverMarkerRef.current.getPosition();
        if (!directionsServiceRef.current) directionsServiceRef.current = new google.maps.DirectionsService();
        if (!directionsRendererRef.current) {
          directionsRendererRef.current = new google.maps.DirectionsRenderer({ suppressMarkers: true, preserveViewport: true });
          directionsRendererRef.current.setMap(mapInstance.current);
        }
        directionsServiceRef.current.route({ origin: dPos, destination: pPos, travelMode: google.maps.TravelMode.DRIVING }, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK || status === 'OK') {
            directionsRendererRef.current.setDirections(result);
            const steps = [];
            const legs = result.routes?.[0]?.legs || [];
            legs.forEach((leg) => {
              leg.steps.forEach((s) => steps.push({ instruction: s.instructions, distance: s.distance?.text, duration: s.duration?.text }));
            });
            setRouteSteps(steps);
            // fit bounds
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(pPos);
            bounds.extend(dPos);
            mapInstance.current.fitBounds(bounds, 80);
          }
        });
      }
    } catch (e) {
      console.warn("Could not update route:", e);
    }
  }, [coords]);

  const callEmergencyAssist = async () => {
    if (!ride?._id) return;
    setActivating(true);
    try {
      // haptic feedback on trigger (short)
      if (navigator.vibrate) navigator.vibrate(50);
      const token = localStorage.getItem("token");
      const payload = { rideId: ride._id, coords: coords ? { latitude: coords.lat, longitude: coords.lng } : null };
      const resp = await axios.post(`${BaseURL}/auth/emergency/assist`, payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(resp.data?.message || "Emergency assist triggered");
    } catch (err) {
      console.error("Emergency assist failed:", err);
      toast.error(err.response?.data?.message || "Failed to trigger emergency assist");
    } finally {
      setActivating(false);
      setShowConfirm(false);
    }
  };

  const handleEmergencyPressStart = () => {
    // start long-press timer (1.2s)
    longPressTimeout.current = setTimeout(() => {
      // subtle haptic/vibration on long-press activation
      if (navigator.vibrate) navigator.vibrate([80, 30, 80]);
      callEmergencyAssist();
    }, 1200);
  };

  const handleEmergencyPressEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-2">Live Trip Share</h2>
        {!ride && <p className="text-sm text-gray-500 mb-4">Loading ride...</p>}
        {ride && (
          <div>
            <p className="text-sm text-gray-600">Driver: {ride.driver?.firstName} {ride.driver?.lastName}</p>
            <p className="text-sm text-gray-600">From: {ride.pickupLocation}</p>
            <p className="text-sm text-gray-600 mb-4">To: {ride.dropoffLocation}</p>

            <div className="border rounded-md p-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2">Last known location:</p>
              <div className="w-full h-64 mb-3 rounded-md overflow-hidden" ref={mapRef} />
              {coords ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Latitude: {coords.lat}</p>
                    <p className="text-sm">Longitude: {coords.lng}</p>
                  </div>
                  <a className="text-sm text-blue-600" href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`} target="_blank" rel="noreferrer">Open in Google Maps</a>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Waiting for driver location...</p>
              )}
              {/* Emergency Assist button - only visible for authenticated users */}
              <div className="mt-3">
                {localStorage.getItem("token") ? (
                  <>
                    <button
                      onMouseDown={handleEmergencyPressStart}
                      onMouseUp={handleEmergencyPressEnd}
                      onMouseLeave={handleEmergencyPressEnd}
                      onTouchStart={handleEmergencyPressStart}
                      onTouchEnd={handleEmergencyPressEnd}
                      onClick={() => setShowConfirm(true)}
                      className="w-full rounded-lg bg-red-600 text-white py-2 font-semibold"
                      disabled={activating}
                    >
                      {activating ? "Sending..." : "Emergency Assist"}
                    </button>
                    <p className="text-[11px] text-gray-200 mt-1">Press & hold to trigger immediately, or tap to confirm.</p>
                  </>
                ) : (
                  <p className="text-xs text-gray-500">Open the app and tap Emergency Assist to alert authorities.</p>
                )}
              </div>
              {/* Turn-by-turn steps */}
              {routeSteps && routeSteps.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Directions</h4>
                  <div className="max-h-48 overflow-auto space-y-2 text-sm text-gray-700">
                    {routeSteps.map((s, i) => (
                      <div key={i} className="p-2 bg-white rounded-md border">
                        <div className="font-medium text-xs text-slate-800">Step {i + 1} • {s.distance || ""} • {s.duration || ""}</div>
                        <div className="text-xs text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: s.instruction }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md z-60">
            <h3 className="text-lg font-semibold mb-2">Confirm Emergency Assist</h3>
            <p className="text-sm text-gray-600 mb-4">This will discreetly notify emergency services and the driver. Are you sure you want to proceed?</p>
            <div className="flex gap-3">
              <button onClick={() => { callEmergencyAssist(); }} className="flex-1 rounded-lg bg-red-600 text-white py-2 font-semibold">Yes, notify</button>
              <button onClick={() => setShowConfirm(false)} className="flex-1 rounded-lg border border-gray-200 py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideShare;
