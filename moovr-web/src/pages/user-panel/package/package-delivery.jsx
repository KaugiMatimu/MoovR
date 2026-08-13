import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import Header from "../../../components/user-panel/header";
import { Link, useNavigate } from "react-router-dom";

const PackageDelivery = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/ride");
  };

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Header */}
      <Header />

      {/* Main content container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center h-full">
        {/* Back Button */}
        <button
          onClick={handleNavigate}
          className="flex items-center text-purple-600 hover:text-purple-800 font-medium mb-6 w-max"
        >
          <FaArrowLeft className="mr-2" />
          
        </button>

        {/* Content and Image Section */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
          {/* Text Section */}
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Delivering Happiness, On-Time, Every Time
            </h2>
            <p className="text-gray-600 text-base sm:text-lg mb-8">
              We prioritize your happiness with reliable, punctual service,
              ensuring every interaction brings joy and satisfaction.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/package/pickup"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-full text-center transition-all duration-200"
              >
                Send a Package
              </Link>
              {/* Future Feature: Receive Package Button
              <button className="bg-purple-100 text-purple-600 font-semibold py-3 px-6 rounded-full">
                Receive a Package
              </button> 
              */}
            </div>
          </div>

          {/* Image Section */}
          <div className="w-full md:w-1/2 max-w-sm mx-auto">
            <img
              src="/images/package-delivery.svg"
              alt="Package Delivery Illustration"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDelivery;
