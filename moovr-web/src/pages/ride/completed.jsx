import React from "react";
import Header from "../../components/header"; // Import your Header component
import CompletedCard from "../../components/ride/completed-card"; // Import the new DriverInfoCard component

const CompletedScreen = () => {
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
          <CompletedCard />
        </div>
      </div>
    </div>
  );
};

export default CompletedScreen;
