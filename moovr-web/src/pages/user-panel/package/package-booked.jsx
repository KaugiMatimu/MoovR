import React from "react";
import Header from "../../../components/user-panel/header";
import { Link, useLocation } from "react-router-dom";

const PackageBooked = () => {
  const location = useLocation();
  const { pkg } = location.state || {};

  return (
    <div className="h-screen w-screen">
      {/* Header */}
      <Header />
      <div className="max-w-[1180px] mx-auto flex flex-col items-center p-4 md:p-12">
        {/* Header Image */}
        <div className="w-full max-h-[470px] max-w-7xl mb-8 overflow-hidden rounded-lg">
          <img
            src="/images/package-booked-img.jpeg" // Replace with the actual image path
            alt="Package Delivery"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col md:flex-row w-full gap-8">
          {/* Title and Description */}
          <div className="text-start mb-8 space-y-3 w-full md:w-2/5">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Get your package ready!
            </h2>
            <p className="text-gray-500 w-full md:w-4/5 pb-5">
              Prepare your package for delivery by securely packing your items
              and labeling them clearly. Ensure all necessary documentation is
              included for a smooth shipping process.
            </p>
            {/* Track Button */}
            <Link to={"/package/track"} state={{ pkg }}>
              <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-8 rounded-full">
                Track your package
              </button>
            </Link>
          </div>

          {/* Delivery Details */}
          <div className="w-full md:w-3/5 max-w-5xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="text-left">
              <h3 className="font-semibold mb-3 md:mb-5">Delivery details</h3>
              <div>
                <p>{pkg?.pickupLocation || "Pickup Location"}</p>
                <p className="text-sm text-gray-500">
                  {pkg?.createdAt ? `Booked at ${new Date(pkg.createdAt).toLocaleTimeString()}` : "Pickup scheduled"}
                </p>
              </div>
            </div>

            <img
              src="/icons/rent/connection.svg"
              alt="Connection"
              className="w-12 h-12 md:w-auto md:h-auto"
            />

            <div className="text-left md:text-right mt-5 md:mt-0">
              <p>{pkg?.dropoffLocation || "Dropoff Location"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageBooked;
