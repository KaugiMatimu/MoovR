import React from "react";
import Header from "../../../components/user-panel/header"; // Import your Header component
import RideOptions from "../../../components/user-panel/ride-options";
import PaymentSelector from "../../../components/user-panel/payment-selector";

const ReserveSelection = () => {
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

        {/* Floating Cards */}
        <div className="absolute top-[10%] left-[10%]  flex flex-col items-center space-y-4">
          {/* Ride Options */}
          <RideOptions />

          {/* Payment Selector */}
          <PaymentSelector pageLink={"/reserve/driver"} />
        </div>
      </div>
    </div>
  );
};

export default ReserveSelection;
