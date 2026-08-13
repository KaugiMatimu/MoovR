import React from "react";
import Header from "../../components/header";
import { BiArrowBack } from "react-icons/bi";
import { FaMapMarkerAlt } from "react-icons/fa";

const ConfirmCar = () => {
  return (
    <div className="h-screen w-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="p-6">
        {/* Back Button */}
        <div className="flex gap-3 items-center mb-8 cursor-pointer py-2 px-3 rounded-[12px] w-fit hover:bg-gray-100">
          <BiArrowBack size={23} />
        </div>

        {/* Car Image Section */}
        <div className="flex justify-center mb-12">
          <div className="relative w-[600px]">
            <img
              src="/images/BMW.png" // Replace with the actual car image path
              alt="Car"
              className="w-[85%] h-auto object-contain"
            />
            <div className="absolute w-full bottom-[10px] left-1/2 transform -translate-x-1/2 ">
              <img src="/images/car-surface.svg" alt="" />
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="grid grid-cols-3 items-end gap-6">
            {/* Delivery Location */}
            <div>
              <label className="block text-gray-500 mb-2">
                Delivery Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Select delivery point"
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
                />
                <FaMapMarkerAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Rent Start Date/Time */}
            <div>
              <label className="block text-gray-500 mb-2">
                Rent Date and Time
              </label>
              <input
                type="text"
                placeholder="Rent start date/time"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>

            {/* Rent End Date/Time */}
            <div className="mt-6 md:mt-0">
              <input
                type="text"
                placeholder="Rent end date/time"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Confirm Button */}
          <div className="flex justify-center mt-8">
            <button className="bg-purple-500 text-white py-3 px-16 rounded-full font-medium hover:bg-purple-600">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCar;
