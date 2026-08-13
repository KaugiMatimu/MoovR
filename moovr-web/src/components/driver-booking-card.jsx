import React from "react";
import { FaStar } from "react-icons/fa";

const DriverBookingCard = ({ name, rating, price, availability, carTypes }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4  w-full m-2 flex flex-col justify-between">
      {/* Driver Info */}
      <div className="flex items-center space-x-3 w-full ">
        <img
          src="/images/avatar.png" // Replace with the driver's image
          alt="Driver"
          className="w-12 h-12 rounded-full"
        />
        <div className="w-full">
          <span className="font-semibold text-gray-800">{name}</span>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center text-yellow-500 text-sm">
              <FaStar className="mr-1" />
              <span>{rating}</span>
            </div>
            <span className="text-sm ml-auto">{availability}</span>
          </div>
        </div>
      </div>

      {/* Car Types */}
      <div className="mt-3">
        <span className="text-primaryGray text-xs">Drive</span>
        <div className="flex space-x-2 mt-1">
          {carTypes.map((type, index) => (
            <span
              key={index}
              className="bg-bgGray  px-[10px] py-1 text-[12px] rounded-full text-xs"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Price and Book Button */}
      <div className="flex justify-between items-center mt-4">
        <button className="bg-primaryPurple text-white py-2 px-6 rounded-full text-[14px] font-[600]">
          Book
        </button>
        <div className="text-right">
          <span className="text-primaryGray text-xs">Per hour</span>
          <p className="font-semibold text-lg">₦{price}</p>
        </div>
      </div>
    </div>
  );
};

export default DriverBookingCard;
