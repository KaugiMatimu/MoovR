import React from "react";
import Header from "../../../components/user-panel/header";
import PackageCars from "../../../components/user-panel/package/selection";
import PaymentDropdown from "../../../components/user-panel/package/payment";

const CarpoolSelection = () => {
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
          <PackageCars />

          {/* Payment Selector */}
          <PaymentDropdown pageLink={"/carpool/driver"} />
        </div>
      </div>
    </div>
  );
};

export default CarpoolSelection;
