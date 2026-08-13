import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../../../components/user-panel/header"; // Import your Header component
import ReviewCard from "../../../components/user-panel/ride/review-card"; // Import the new DriverInfoCard component
import { BaseURL } from "../../../utils/BaseURL";

const ReviewScreen = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const rideState = location.state?.ride;
  const [rideId, setRideId] = useState(
    location.state?.rideId || rideState?._id || queryParams.get("rideId")
  );
  const [driverId, setDriverId] = useState(
    location.state?.driverId || rideState?.driver?._id || rideState?.driver || queryParams.get("driverId")
  );
  const [driverName, setDriverName] = useState(
    location.state?.driverName ||
      (rideState?.driver
        ? `${rideState.driver.firstName || ""} ${rideState.driver.lastName || ""}`.trim()
        : "") ||
      queryParams.get("driverName")
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRideInfo = async () => {
      if (driverId && driverName) return;
      if (!rideId) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BaseURL}/rides/status/${rideId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ride = response.data?.ride;
        if (ride) {
          if (!rideId && ride._id) {
            setRideId(ride._id);
          }
          if (!driverId && ride.driver) {
            setDriverId(ride.driver._id || ride.driver);
          }
          if (!driverName && ride.driver) {
            setDriverName(`${ride.driver.firstName || ""} ${ride.driver.lastName || ""}`.trim() || "Driver");
          }
        }
      } catch (error) {
        console.error("Unable to fetch ride details for review:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRideInfo();
  }, [driverId, driverName, rideId]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p>Loading review details...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
      {/* Header */}
      <Header />

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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-4">
          {/* Driver Info Card */}
          <ReviewCard 
            path={"/ride/thank-you"} 
            driverId={driverId} 
            driverName={driverName} 
            rideId={rideId}
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewScreen;
