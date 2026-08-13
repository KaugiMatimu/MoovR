import React from "react";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaTachometerAlt,
  FaCogs,
  FaUsers,
} from "react-icons/fa"; // Icons for details
import Header from "../../components/header";

const RentDetails = () => {
  return (
    <div className="h-screen w-screen bg-gray-50">
      {/* Header */}
      <Header />

      <section className="p-6 md:p-12">
        {/* Back Button */}
        <div className="flex items-center mb-4 cursor-pointer">
          <FaArrowLeft className="text-lg mr-2" />
          <span className="text-sm font-medium">Details</span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Left Section - Car Details */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md w-full md:w-1/2 mb-8 md:mb-0">
            {/* Car Name and Location */}
            <h2 className="text-lg font-semibold">Honda Civic</h2>
            <p className="text-gray-500 mb-2">82BG879</p>
            <div className="flex items-center text-gray-500 text-sm mb-4">
              <FaMapMarkerAlt className="mr-2" />
              <span>Abuja Continental Hotel</span>
            </div>

            {/* Car Description */}
            <p className="text-gray-600 text-sm mb-6">
              Experience the thrill of driving a Honda Civic, where luxury meets
              performance. Perfect for those who crave style and excitement on
              every journey.
            </p>

            {/* Specifications */}
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Specifications
            </h3>
            <div className="flex space-x-4 mb-6">
              <div className="flex flex-col items-center bg-purple-100 text-purple-700 rounded-lg p-3">
                <FaUsers className="text-lg" />
                <span className="text-sm">4 Seats</span>
              </div>
              <div className="flex flex-col items-center bg-purple-100 text-purple-700 rounded-lg p-3">
                <FaCogs className="text-lg" />
                <span className="text-sm">Auto</span>
              </div>
              <div className="flex flex-col items-center bg-purple-100 text-purple-700 rounded-lg p-3">
                <FaTachometerAlt className="text-lg" />
                <span className="text-sm">400Km/h</span>
              </div>
            </div>

            {/* Rental Timeline */}
            <div className="flex items-center justify-between text-gray-700 mb-6">
              <div className="flex flex-col text-center">
                <span className="font-medium">Wed 05, 4:15PM</span>
                <span className="text-xs">Rent start date/time</span>
              </div>
              <div className="border-t border-dashed border-gray-300 flex-1 mx-4"></div>
              <div className="flex flex-col text-center">
                <span className="font-medium">Thu 06, 4:15PM</span>
                <span className="text-xs">Rent end date/time</span>
              </div>
            </div>

            {/* Rental Price */}
            <div className="flex justify-between text-gray-700 mb-2">
              <span className="font-medium">Rental Price</span>
              <span className="text-lg font-semibold">₦10/hour</span>
            </div>

            {/* Payment Method */}
            <div className="flex items-center mt-4">
              <img
                src="/images/mastercard.svg" // Replace with your payment icon path
                alt="Debit Card"
                className="h-6 w-auto mr-2"
              />
              <span className="text-sm font-medium">Debit Card</span>
            </div>
          </div>

          {/* Right Section - Car Image */}
          <div className="relative w-full md:w-1/2">
            <img
              src="/images/BMW.png" // Replace with your car image path
              alt="Rented Car"
              className="w-full max-w-xs"
            />
            {/* <div className="absolute top-4 right-4 bg-purple-500 text-white py-2 px-4 rounded-full text-xs font-medium shadow-lg">
            Tap to unlock
          </div> */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default RentDetails;
