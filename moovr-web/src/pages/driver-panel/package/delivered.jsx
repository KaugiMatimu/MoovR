import React from "react";
import Header from "../../../components/driver-panel/header"; // Import your Header component

const PackageDelivered = () => {
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
          <div className=" bg-white rounded-2xl shadow-lg p-8 w-96 text-center">
            <h2 className="font-semibold text-gray-800 mb-4">
              Package delivered
            </h2>
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center">
                <img
                  src="/images/check.png" // Replace with your checkmark icon
                  alt="Checkmark"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDelivered;
