import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Header from "../../components/user-panel/header";
import { useSocket } from "../../context/LocationProvider";

const LiveLocationRecipientScreen = () => {
  const { socket } = useSocket();
  const { senderId } = useParams();
  const [searchParams] = useSearchParams();
  const rideId = searchParams.get("rideId");
  const [shareData, setShareData] = useState(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isReceivingUpdates, setIsReceivingUpdates] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const routeLineRef = useRef(null);

  useEffect(() => {
    if (!socket || !senderId) return;

    socket.emit("join", senderId.toString());
    if (rideId) {
      socket.emit("joinRide", rideId);
    }
  }, [socket, senderId, rideId]);

  useEffect(() => {
    if (!socket || !senderId) return;

    const handleLiveLocation = (data) => {
      if (!data?.coordinates) return;

      const matchesRecipient = data.targetUserId?.toString() === senderId.toString() || data.senderId?.toString() === senderId.toString();
      const matchesRide = rideId ? data.rideId?.toString() === rideId.toString() : true;
      if (!matchesRecipient && !matchesRide) return;

      setShareData({
        senderName: data.senderName || (data.passengerId ? "Passenger" : "Passenger"),
        coordinates: data.coordinates,
        rideId: data.rideId || rideId,
        sharedAt: data.sharedAt || new Date().toISOString(),
      });
      setIsReceivingUpdates(true);
      setLastUpdated(new Date().toLocaleTimeString());
    };

    socket.on("liveLocationShared", handleLiveLocation);
    socket.on("passengerLocationUpdate", handleLiveLocation);
    return () => {
      socket.off("liveLocationShared", handleLiveLocation);
      socket.off("passengerLocationUpdate", handleLiveLocation);
    };
  }, [socket, senderId, rideId]);

  useEffect(() => {
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    const existingScript = document.getElementById("googleMapsScript");
    if (existingScript) {
      existingScript.onload = initializeMap;
      return;
    }

    const script = document.createElement("script");
    script.id = "googleMapsScript";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    script.onerror = () => setError("Google Maps could not be loaded.");
    document.head.appendChild(script);
  }, []);

  const initializeMap = () => {
    const google = window.google;
    if (!google?.maps || !mapRef.current) return;

    const defaultCenter = { lat: 6.5244, lng: 3.3792 };
    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 14,
      disableDefaultUI: true,
    });

    if (shareData?.coordinates) {
      const [lng, lat] = shareData.coordinates;
      const position = { lat, lng };
      markerRef.current = new google.maps.Marker({
        position,
        map: mapInstance.current,
        title: "Passenger location",
      });
      mapInstance.current.setCenter(position);
    }
  };

  useEffect(() => {
    if (!shareData?.coordinates || !window.google?.maps || !mapInstance.current) return;

    const [lng, lat] = shareData.coordinates;
    const position = { lat, lng };
    mapInstance.current.panTo(position);
    mapInstance.current.setZoom(15);

    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new window.google.maps.Marker({
        position,
        map: mapInstance.current,
        title: "Passenger location",
      });
    }

    const recipientPosition = { lat: 6.5244, lng: 3.3792 };
    if (routeLineRef.current) {
      routeLineRef.current.setMap(null);
    }

    routeLineRef.current = new window.google.maps.Polyline({
      path: [recipientPosition, position],
      geodesic: true,
      strokeColor: "#7c3aed",
      strokeOpacity: 0.9,
      strokeWeight: 3,
      map: mapInstance.current,
    });
  }, [shareData?.coordinates]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header disableNavigation />
      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primaryPurple">Live trip location</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-800">
            {shareData?.senderName ? `${shareData.senderName}'s live location` : "Passenger live location"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {shareData?.rideId ? `Ride ID: ${shareData.rideId}` : "Watching the passenger’s current position in real time."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${isReceivingUpdates ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${isReceivingUpdates ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              {isReceivingUpdates ? "Sharing active" : "Waiting for updates"}
            </span>
            <span className="text-sm font-medium text-slate-700">
              Last updated: {lastUpdated || (shareData?.sharedAt ? new Date(shareData.sharedAt).toLocaleTimeString() : "Waiting for update")}
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div ref={mapRef} className="h-[70vh] w-full" />
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          {shareData?.coordinates ? (
            <>
              <p className="text-sm font-semibold text-slate-800">Current position</p>
              <p className="mt-2 text-sm text-slate-600">
                Latitude: <span className="font-medium text-slate-900">{shareData.coordinates[1]}</span>
              </p>
              <p className="text-sm text-slate-600">
                Longitude: <span className="font-medium text-slate-900">{shareData.coordinates[0]}</span>
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-600">Waiting for the passenger to share their live location…</p>
          )}
          {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
          {searchParams.get("rideId") ? (
            <p className="mt-3 text-xs text-slate-500">Shared ride: {searchParams.get("rideId")}</p>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default LiveLocationRecipientScreen;
