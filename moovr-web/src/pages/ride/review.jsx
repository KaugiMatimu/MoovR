import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/header"; // Import your Header component
import ReviewCard from "../../components/ride/review-card"; // Import the new DriverInfoCard component

const ReviewScreen = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const driverId = location.state?.driverId || queryParams.get("driverId");
  const driverName = location.state?.driverName || queryParams.get("driverName");
  const rideId = location.state?.rideId || queryParams.get("rideId");

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
            path="/ride/thank-you"
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
