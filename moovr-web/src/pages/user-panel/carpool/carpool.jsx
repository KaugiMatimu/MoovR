import React from "react";
import Header from "../../../components/user-panel/header";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const Carpool = () => {
  return (
    <div className="h-screen w-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="relative h-full">
        {/* Map Background */}
        <div className="absolute inset-0">
          <img
            title="Map"
            src="/images/full-map-img.png"
            alt="Map"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Floating Card for Pickup Selection */}
        <div className="absolute top-[10%] left-[10%] transform md:w-[400px]  space-y-4 w-[80%] ">
          {/* Search Input */}

          {/* Back Button */}
          <Link
            to={"/package"}
            className="flex items-center mb-20 cursor-pointer"
          >
            <FaArrowLeft className="text-lg mr-2" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex gap-3 items-center relative mb-4 bg-white py-8 pr-8 pl-4">
            <img src="/icons/carpool/carpool.svg" alt="" />
            <div className="space-y-5">
              <input
                type="text"
                placeholder="Abuja"
                className="relative w-full px-4 py-3 bg-gray-100 rounded-full border border-gray-300 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Enter destination"
                className="relative w-full px-4 py-3 bg-gray-100 rounded-full border border-gray-300 focus:outline-none"
              />
            </div>
          </div>
          <div className=" p-4 md:p-7 bg-white rounded-lg shadow-lg">
            <div className=" text-lg font-semibold">
              Choose pickup & destination point
            </div>

            {/* Instruction Text */}
            <div className="text-sm text-start text-gray-500 my-2 pb-4">
              Drag map to adjust
            </div>

            {/* Confirm Button */}
            <Link
              to={"/carpool/selection"}
              className="w-full py-3 flex justify-center rounded-full bg-purple-500 text-white font-semibold hover:bg-purple-600"
            >
              Confirm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carpool;
