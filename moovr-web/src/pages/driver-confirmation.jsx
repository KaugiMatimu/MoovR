import React from "react";
import Header from "../components/header"; // Import the Header component
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { FaPhoneAlt, FaRegCommentDots, FaStar } from "react-icons/fa";
import { BiArrowBack } from "react-icons/bi";

const DriverConfirmation = () => {
  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="relative min-h-[800px] h-screen w-full">
        {/* Map Background */}
        <div className="absolute inset-0 w-full h-full">
          <img
            title="Map"
            src="/images/full-map-img.png" // Replace with your map image
            className="w-full h-full object-cover"
          />
        </div>

        {/* Floating Card Section */}
        <div className="absolute top-20 left-6  space-y-4 ">
          <div className="flex gap-3 items-center mb-4 cursor-pointer  rounded-[12px] w-fit">
            <BiArrowBack size={23} />
            <h1 className="text-lg font-semibold ">Driver Booking</h1>
          </div>

          {/* Driver Details */}
          <div className="bg-white rounded-2xl shadow-md p-5">
            {/* Header Section */}
            <div className="flex items-center">
              <div className="relative">
                <img
                  src="/images/avatar.png" // Replace with the driver image
                  alt="Driver"
                  className="w-16 h-16 rounded-full border-2 border-purple-500"
                />
                <div className="absolute -top-1 right-2 bg-purple-500 w-3 h-3 rounded-full"></div>
              </div>
              <div className="ml-4 flex-1">
                <h2 className="font-semibold text-gray-800 text-lg">Adewale</h2>
                <div className="flex items-center text-yellow-500">
                  <FaStar className="mr-1" />
                  <span className="text-sm font-medium">4.9</span>
                </div>
              </div>

              {/* Experience and Language */}
              <div className="ml-6">
                <p className="text-gray-500 text-sm">Experience</p>
                <p className="font-medium text-gray-800">4 Years</p>
              </div>
              <div className="ml-6">
                <p className="text-gray-500 text-sm">Language</p>
                <p className="font-medium text-gray-800">Eng, French</p>
              </div>
            </div>

            {/* Drive Types */}

            <div className="mt-4">
              <span className="text-gray-500 text-sm">Drive</span>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2 mt-2">
                  {["Suv", "Sedan", "Mini"].map((type, index) => (
                    <span
                      key={index}
                      className="bg-bgGray  px-3 py-1 rounded-full text-xs"
                    >
                      {type}
                    </span>
                  ))}
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-4">
                  <button className="">
                    {/* <FaRegCommentDots className="w-5 h-5" /> */}
                    <img
                      src="/public/icons/ride/chat.svg"
                      alt=""
                      className="w-7 h-auto"
                    />
                  </button>
                  <button className="">
                    <img
                      src="/public/icons/ride/call.svg"
                      alt=""
                      className="w-7 h-auto"
                    />
                    {/* <FaPhoneAlt className="w-5 h-5" /> */}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Location Input */}
          <div className="bg-white rounded-2xl shadow-md p-4">
            <h3 className="text-gray-800 font-semibold mb-2">Location</h3>
            <input
              type="text"
              placeholder="Select pick-up point"
              className="w-full p-3 bg-bgGray rounded-lg focus:outline-none text-gray-600"
            />
          </div>

          {/* Car Details Input */}
          <div className="bg-white rounded-2xl shadow-md p-4">
            <h3 className="text-gray-800 font-semibold mb-2">Car details</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Car name/model"
                className="w-full p-3 bg-bgGray rounded-lg focus:outline-none text-gray-600"
              />
              <input
                type="text"
                placeholder="Car number"
                className="w-full p-3 bg-bgGray rounded-lg focus:outline-none text-gray-600"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-md p-4">
            {/* Title */}
            <h3 className="text-gray-800 font-semibold mb-3">
              Select payment method
            </h3>

            {/* Payment Method Input Field */}
            <div className="flex items-center bg-bgGray rounded-full p-3">
              <img
                src="/images/mastercard.svg" // Replace with the actual card image
                alt="Card Icon"
                className="w-8 h-8"
              />
              <input
                type="text"
                value="5144 6xxx xxxx xxxx"
                readOnly
                className="ml-3 bg-transparent focus:outline-none text-gray-700 font-medium flex-grow"
              />
              <FaChevronDown className="ml-auto text-gray-500" />
            </div>
          </div>
        </div>

        {/* Price and Confirm Button */}
        <div className="absolute bottom-20 right-6 min-w-[400px]  space-y-4 ">
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center space-y-4">
            {/* Price Section */}
            <div className="w-full flex justify-between items-center">
              <p className="text-gray-700 font-medium">Price</p>
              <p className="text-xl font-semibold">
                ₦7.80<span className="text-gray-500 text-sm">/hour</span>
              </p>
            </div>

            {/* Confirm Button */}
            <button className="bg-purple-500 text-white py-3 w-full rounded-full text-lg font-semibold hover:bg-purple-600">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverConfirmation;
