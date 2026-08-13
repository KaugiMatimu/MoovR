import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../../../components/user-panel/header"; // Import your Header component
import StartRideCard from "../../../components/user-panel/start-ride-card"; // Import the new DriverInfoCard component
import { BaseURL } from "../../../utils/BaseURL";
import usePreventLeave from "../../../hooks/usePreventLeave";
import { useSocket } from "../../../context/LocationProvider";

const StartRideScreen = () => {
  const { socket, joinRideRoom } = useSocket();
  const location = useLocation();
  const [ride, setRide] = useState(location.state?.ride || null);
  const [loading, setLoading] = useState(!Boolean(location.state?.ride));
  const [targetIdentifier, setTargetIdentifier] = useState("");
  const [shareTargetUserId, setShareTargetUserId] = useState(null);
  const [shareMessage, setShareMessage] = useState("");
  const rideId = location.state?.ride?._id || new URLSearchParams(location.search).get("rideId");
  const shouldShareLocation = Boolean(rideId && ["accepted", "running", "arrived"].includes(ride?.status));

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
      if (ride || !rideId) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BaseURL}/rides/status/${rideId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.ride) {
          setRide(response.data.ride);
        }
      } catch (error) {
        console.error("Unable to fetch ride for start ride screen:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [ride, rideId]);

  useEffect(() => {
    if (!socket || !rideId) return;
    joinRideRoom(rideId);
  }, [socket, rideId, joinRideRoom]);

  useEffect(() => {
    if (!rideId) return;
    const storedTarget = getStoredShareTarget(rideId);
    if (storedTarget?.userId) {
      setShareTargetUserId(storedTarget.userId);
      if (storedTarget.identifier) {
        setTargetIdentifier(storedTarget.identifier);
      }
    }
  }, [rideId]);

  const handleShareLiveLocation = async () => {
    if (!targetIdentifier.trim() || !rideId || !navigator.geolocation) {
      setShareMessage("Enter a phone, email, or user ID to share your trip.");
      return;
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
        body: JSON.stringify({ targetIdentifier: targetIdentifier.trim(), rideId, latitude, longitude }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to share live location");
      const targetUserId = data.userId;
      persistShareTarget(rideId, targetUserId, targetIdentifier.trim());
      setShareTargetUserId(targetUserId);
      const shareUrl = `${window.location.origin}/live-location/${targetUserId}?rideId=${rideId}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setShareMessage(`Live tracking link ready for ${data.user?.firstName || targetIdentifier}. Link copied to clipboard.`);
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error sharing live passenger location:", error);
      setShareMessage(error.message || "Unable to share your live location right now.");
    }
  };

  useEffect(() => {
    if (!rideId || !shouldShareLocation || !navigator.geolocation) return;

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
            body: JSON.stringify({ latitude, longitude, rideId, targetUserId: shareTargetUserId || getStoredShareTarget(rideId)?.userId }),
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
  }, [rideId, shouldShareLocation, shareTargetUserId]);

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
          />
        </div>

        {/* Floating Driver Info Card */}
        <div className="absolute top-[10%] left-[10%]  flex flex-col items-center space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-6 w-[350px] text-center">
              <p className="text-gray-700">Loading ride details...</p>
            </div>
          ) : (
            <StartRideCard ride={ride} />
          )}

          <div className="w-[350px] rounded-2xl bg-white/95 p-4 shadow-lg">
            <p className="text-sm font-semibold text-slate-800">Share your live trip location</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartRideScreen;
