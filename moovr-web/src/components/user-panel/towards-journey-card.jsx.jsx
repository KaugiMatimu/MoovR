import React, { useEffect } from "react";
import { FaStar, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/LocationProvider";
import toast from "react-hot-toast";

import axios from "axios";
import { BaseURL } from "../../utils/BaseURL";

const TowardsJourney = ({ ride }) => {
  const { socket } = useSocket();
  const navigate = useNavigate();

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
      console.log("Ride Status Updated:", updatedRide);
      // Check if it's the current ride and if it's completed
      if (updatedRide._id === ride?._id && updatedRide.status === "completed") {
        toast.success("Ride Completed!");

        const paymentUrl = updatedRide.paymentUrl || updatedRide.authorization_url;

        if (paymentUrl) {
          toast.loading("Redirecting to payment...");
          // If payment is needed (Stripe/Paystack), redirect to payment page
          setTimeout(() => {
            window.location.href = paymentUrl;
          }, 2000);
        } else {
          // Otherwise go to completed screen (handles Wallet and Cash)
          if (updatedRide.paymentMethod === "Cash") {
            toast(`Please pay ${updatedRide.fare} NGN to the driver in cash.`, {
              icon: "💰",
              duration: 6000,
            });
          }
          
          navigate("/ride/completed", { 
            state: { 
              rideId: updatedRide._id,
              driverId: ride?.driver, 
              driverName: ride?.driverName || "Driver",
              isPackage: !!updatedRide.packageDetails 
            } 
          });
        }
      }
    };

    socket.on("rideStatusUpdated", handleStatusUpdate);

    return () => {
      socket.off("rideStatusUpdated", handleStatusUpdate);
    };
  }, [socket, ride, navigate]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 w-[350px] flex flex-col items-center space-y-4">
      {/* Title */}
      <h2 className="text-center text-lg font-semibold text-gray-700">
        Towards destination
      </h2>

      {/* Estimated Time */}
      <div className="flex items-center justify-between w-full px-4">
        <span className="text-gray-400">Estimated time</span>
        <span className="text-sm font-semibold text-purple-500 bg-purple-100 px-3 py-1 rounded-full">
          {ride?.estimatedTime || "05"} min
        </span>
      </div>

      {/* Driver Info */}
      <div className="flex items-center w-full justify-around mt-2">
        {/* Driver Profile with Rating */}
        <div className="relative flex items-center space-x-2">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg flex items-center justify-center">
            {ride?.driver?.profilePicture ? (
              <img
                src={ride.driver.profilePicture}
                alt="Driver"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-full h-full text-gray-400 bg-white" />
            )}
          </div>
          <div className="text-center">
            <span className="font-semibold text-gray-800">
              {ride?.driver ? `${ride.driver.firstName} ${ride.driver.lastName}` : (ride?.driverName || "Driver")}
            </span>
            <p className="text-sm text-gray-500">{ride?.paymentMethod ? `${ride.paymentMethod} Payment` : "Cash Payment"}</p>
          </div>
          <div className="absolute -bottom-2 left-0 transform translate-x-2 bg-purple-100 text-purple-500 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
            <FaStar className="text-yellow-500 w-3 h-3" />
            <span>4.9</span>
          </div>
        </div>

        <img
          src="/images/driver/straight-car.png" // Replace with car image
          alt="Car"
          className="w-24 h-12 object-cover"
        />

        {/* Car Information */}
        <div className="text-center">
          <span className="font-semibold text-gray-800 block">82BG879</span>
          <p className="text-sm text-gray-500">{ride?.vehicleType || "Silver Honda Civic"}</p>
        </div>
      </div>

      <div className="flex gap-5 w-full">
        <button 
          onClick={handleCancelRide}
          className="bg-red-100 text-red-600 hover:bg-red-200 transition-colors w-full py-3 rounded-full font-semibold"
        >
          Cancel Ride
        </button>
        <div className="bg-babyPurple text-primaryPurple p-3 rounded-full">
          <img src="/icons/ride/shield.svg" alt="" className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default TowardsJourney;
