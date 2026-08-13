import React from "react";
import Header from "../../../components/user-panel/header"; 
import { FaStar, FaUserCircle, FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

const Driver = () => {
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
        <div className="absolute top-[10%] left-[10%]  flex flex-col items-center space-y-4">
          {/* Driver Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[350px] flex flex-col items-center space-y-4">
            {/* Title */}
            <h2 className="text-center text-lg font-semibold text-gray-700">
              Meet the driver at Conoil
            </h2>

            {/* Estimated Time */}
            <div className="flex items-center justify-between w-full">
              <span className="text-gray-400">Estimated time</span>
              <span className="text-sm font-semibold text-purple-500 bg-purple-100 px-3 py-1 rounded-full">
                3 min
              </span>
            </div>

            {/* Driver Info */}
            <div className="relative flex items-center mt-2">
              <div className="absolute top-3 z-40">
                <div className="relative">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-lg flex items-center justify-center">
                    <FaUserCircle className="w-full h-full text-gray-400 bg-white" />
                  </div>
                  <div className="absolute top-0 -right-1 bg-white rounded-full border border-white z-50">
                    <FaCheckCircle className="text-blue-500 w-5 h-5" />
                  </div>
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
              <span className="font-semibold text-gray-900 text-lg">
                82BG879
              </span>
              <p className="text-sm text-gray-500">Silver Honda Civic</p>
            </div>

            {/* Message to Driver */}

            <Link
              to={"/reserve/successful"}
              className="px-6 py-2 w-full flex justify-center bg-purple-500 text-white rounded-full hover:bg-purple-600"
            >
              Reserve a ride
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Driver;
