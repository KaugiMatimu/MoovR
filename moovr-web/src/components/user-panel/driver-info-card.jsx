import React, { useEffect, useState } from "react";
import { FaPhoneAlt, FaRegCommentDots, FaUserCircle, FaCheckCircle } from "react-icons/fa";
import { MdOutlineShield } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/LocationProvider";

import axios from "axios";
import { BaseURL } from "../../utils/BaseURL";
import toast from "react-hot-toast";

const DriverInfoCard = ({ ride, disableStatusRedirect = false }) => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [localRide, setLocalRide] = useState(ride);
  const [rideStatus, setRideStatus] = useState(ride?.status || "accepted");
  const [statusLabel, setStatusLabel] = useState(getStatusLabel(rideStatus));
  const [countdownSeconds, setCountdownSeconds] = useState(getCountdownSeconds(ride));
  const displayRide = localRide || ride;

  function getStatusLabel(status) {
    switch (status) {
      case "accepted":
        return "Driver accepted your ride and is heading your way.";
      case "running":
        return "Your driver is almost here. Please stay ready at pickup.";
      case "arrived":
        return "Driver has arrived at your pickup location.";
      case "completed":
        return "Ride completed. Please settle payment or rate your driver.";
      case "rejected":
        return "Ride request was rejected. Please try again.";
      default:
        return "Awaiting your driver.";
    }
  }

  function getCountdownSeconds(currentRide) {
    if (!currentRide || !currentRide.status) return 180;
    if (["arrived", "completed", "rejected"].includes(currentRide.status)) return 0;
    const minutes = Number(currentRide?.timeToPickup || currentRide?.estimatedTime || 3);
    return Math.max(60, Math.round(minutes * 60));
  }

  function formatCountdown(seconds) {
    if (!seconds || seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function getProgressValue(status) {
    switch (status) {
      case "accepted":
        return 30;
      case "running":
        return 65;
      case "arrived":
        return 100;
      case "completed":
        return 100;
      default:
        return 20;
    }
  }

  const showCountdown = ["accepted", "running"].includes(rideStatus);
  const countdownLabel = rideStatus === "accepted"
    ? `Fetching driver details — arriving in ${formatCountdown(countdownSeconds)}`
    : rideStatus === "running"
      ? `Driver is nearby — ETA ${formatCountdown(countdownSeconds)}`
      : "";

  useEffect(() => {
    setLocalRide(ride);
    setRideStatus(ride?.status || "accepted");
    setCountdownSeconds(getCountdownSeconds(ride));
  }, [ride]);

  useEffect(() => {
    setStatusLabel(getStatusLabel(rideStatus));
  }, [rideStatus]);

  useEffect(() => {
    if (!["accepted", "running"].includes(rideStatus)) return;

    const interval = setInterval(() => {
      setCountdownSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [rideStatus]);

  const handleCancelRide = async () => {
    if (!ride?._id) return;

    if (!window.confirm("Are you sure you want to cancel this ride?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BaseURL}/rides/cancel/${ride._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        toast.success("Ride cancelled.");
        navigate("/ride");
      }
    } catch (error) {
      console.error("Error cancelling ride:", error);
      toast.error("Failed to cancel ride.");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (updatedRide) => {
      const currentRideId = ride?._id || localRide?._id;
      if (!currentRideId || updatedRide._id !== currentRideId) return;

      setLocalRide(updatedRide);
      setRideStatus(updatedRide.status);
      setCountdownSeconds(getCountdownSeconds(updatedRide));

      if (disableStatusRedirect) return;

      if (updatedRide.status === "arrived") {
        navigate(`/ride/start?rideId=${updatedRide._id}`, { state: { ride: updatedRide } });
      }
      if (updatedRide.status === "running") {
        navigate(`/ride-car/towards-destination?rideId=${updatedRide._id}`, { state: { ride: updatedRide } });
      }
      if (updatedRide.status === "completed") {
        navigate(`/ride/completed?rideId=${updatedRide._id}`, { state: { rideId: updatedRide._id, ride: updatedRide } });
      }
    };

    socket.on("rideStatusUpdated", handleStatusUpdate);

    return () => {
      socket.off("rideStatusUpdated", handleStatusUpdate);
    };
  }, [socket, ride, localRide, navigate]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-[350px] flex flex-col items-center space-y-4">
      {/* Title */}
      <h2 className="text-center text-lg font-semibold text-gray-700">
        Meet the driver at {displayRide?.pickupLocation || "Pickup point"}
      </h2>
      <p className="text-center text-sm text-gray-500 mt-1">{statusLabel}</p>

      {rideStatus === "running" && (
        <div className="w-full rounded-2xl bg-purple-50 border border-purple-200 py-3 px-4 mt-4 text-center text-sm text-purple-700 animate-pulse shadow-sm">
          <p className="font-semibold">Arriving soon</p>
          <p className="text-xs text-purple-600 mt-1">Your driver is just minutes away. Please stay near your pickup spot.</p>
        </div>
      )}

      {rideStatus === "arrived" && (
        <div className="w-full rounded-2xl bg-emerald-50 border border-emerald-200 py-3 px-4 mt-4 text-center text-sm text-emerald-700 shadow-sm">
          <p className="font-semibold">Driver has arrived</p>
          <p className="text-xs text-emerald-600 mt-1">Your driver is waiting at the pickup location. Please get ready to board.</p>
        </div>
      )}

      {/* Progress */}
      <div className="w-full">
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden mt-4">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-500"
            style={{ width: `${getProgressValue(rideStatus)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">{rideStatus === "accepted" ? "Driver en route" : rideStatus === "running" ? "Approaching pickup" : rideStatus === "arrived" ? "Driver arrived" : ""}</span>
          {showCountdown && <span>{countdownLabel}</span>}
        </div>
      </div>

      {/* Estimated Time */}
      <div className="flex items-center justify-between w-full">
        <span className="text-gray-400">Estimated time</span>
        <span className="text-sm font-semibold text-purple-500 bg-purple-100 px-3 py-1 rounded-full">
          {displayRide?.timeToPickup || displayRide?.estimatedTime || "3"} min
        </span>
      </div>

      {/* Driver Info */}
      <div className="relative flex items-center mt-2">
        <div className="absolute top-3 z-40">
          <div className="relative">
            <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-lg">
              {displayRide?.driver?.profilePicture ? (
                <img
                  src={displayRide.driver.profilePicture}
                  alt="Driver"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUserCircle className="w-full h-full text-gray-400 bg-white" />
              )}
            </div>
            {displayRide?.driver?.isVerified && (
              <div className="absolute top-0 -right-1 bg-white rounded-full border border-white z-50">
                <FaCheckCircle className="text-blue-500 w-5 h-5" />
              </div>
            )}
          </div>
          <div className="text-center ml-2">
            <span className="font-semibold text-gray-800">
              {displayRide?.driver ? `${displayRide.driver.firstName} ${displayRide.driver.lastName}` : (displayRide?.driverName || "Driver")}
            </span>
            <p className="text-sm text-gray-500">{displayRide?.paymentMethod ? `${displayRide.paymentMethod} Payment` : "Cash Payment"}</p>
          </div>
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-purple-100 text-purple-500 text-xs font-semibold px-2 py-1 rounded-full flex items-center space-x-1">
            <FaStar className="text-yellow-500 w-3 h-3" />
            <span>4.9</span>
          </div>
        </div>
        <img
          src="/images/driver/straight-car.png" // Replace with car image
          alt="Car"
          className=" w-auto h-[110px] transform scale-x-[-1] z-30"
        />
      </div>

      {/* Car Information */}
      <div className="text-center">
        <span className="font-semibold text-gray-900 text-lg">{displayRide?.vehicleNumber || "82BG879"}</span>
        <p className="text-sm text-gray-500">{displayRide?.vehicleType || "Silver Honda Civic"}</p>
      </div>

      {/* Message to Driver */}

      {/* Action Buttons */}
      <div className="flex justify-between z-20 items-center w-full mt-2 space-x-4">
        <div className="w-full flex-1 z-50">
          <input
            type="text"
            placeholder="Message to driver"
            className="w-full p-2 px-4 border rounded-full text-sm text-gray-500 focus:outline-none bg-gray-100"
            disabled
          />
        </div>

        <button className="bg-purple-100 text-purple-500 rounded-full p-3 shadow-md">
          <img src="/icons/ride/call.svg" className="w-5 h-5" />
        </button>
        <button className="bg-purple-100 text-purple-500 rounded-full p-3 shadow-md">
          <img src="/icons/ride/driver.svg" className="w-5 h-5" />
        </button>
      </div>

      {/* Cancel Button */}
      <div className="w-full pt-2">
        <button 
          onClick={handleCancelRide}
          className="w-full py-2 px-4 border border-red-500 text-red-500 rounded-full text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          Cancel Ride
        </button>
      </div>
    </div>
  );
};

export default DriverInfoCard;
