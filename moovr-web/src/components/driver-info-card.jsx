import React from "react";
import { FaPhoneAlt, FaRegCommentDots } from "react-icons/fa";
import { MdOutlineShield } from "react-icons/md";
import { FaStar } from "react-icons/fa";

const DriverInfoCard = () => {
  return (
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
          <div className="relative w-16 h-16 rounded-full overflow-hidden  shadow-lg">
            <img
              src="/images/avatar.png" // Replace with driver image
              alt="Driver"
              className="w-full h-full object-cover"
            />
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
        <span className="font-semibold text-gray-900 text-lg">82BG879</span>
        <p className="text-sm text-gray-500">Silver Honda Civic</p>
      </div>

      {/* Message to Driver */}

      {/* Action Buttons */}
      <div className="flex justify-between z-20 items-center w-full mt-2 space-x-4">
        <div className="w-full flex-1 z-50`">
          <input
            type="text"
            placeholder="Message to driver"
            className="w-full p-2 px-4 border rounded-full text-sm text-gray-500 focus:outline-none bg-gray-100"
            disabled
          />
        </div>

        <button className="bg-purple-100 text-purple-500 rounded-full p-3 shadow-md">
          <img src="/icons/ride/call.svg" className="w-5 h-5" />
        </button>
        <button className="bg-purple-100 text-purple-500 rounded-full p-3 shadow-md">
          <img src="/icons/ride/driver.svg" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DriverInfoCard;
