import React from "react";
import Header from "../../components/driver-panel/header"; // Import your Header component
import ThankYouCard from "../../components/user-panel/ride/thankyou-card"; // Import the new DriverInfoCard component

const ThankYou = () => {
  return (
    <div className="h-screen w-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="relative h-full">
        {/* Map Background */}
        <div className="absolute inset-0 ">
          <img title="Map" src="/map.png" className="w-full h-full" />
        </div>

        {/* Floating Driver Info Card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-4">
          {/* Driver Info Card */}
          <ThankYouCard link={"/d/dashboard"} />
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
