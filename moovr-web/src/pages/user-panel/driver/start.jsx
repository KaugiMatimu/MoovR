import React from "react";
import Header from "../../../components/user-panel/header"; 
import { FaPhoneAlt, FaRegCommentDots, FaStar } from "react-icons/fa";
import { BiArrowBack } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";

const DriverStart = () => {
  const navigate = useNavigate();

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
          <button
            onClick={() => navigate(-1)}
            className="flex gap-3 items-center mb-8 cursor-pointer py-2 px-3 rounded-[12px] w-fit hover:bg-gray-100"
          >
            <BiArrowBack size={23} /> Back
          </button>

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
              <div className="ml-4 flex-1 text-start">
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

            <div className="mt-4 text-start">
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
        </div>
      </div>
    </div>
  );
};

export default DriverStart;
