import React from "react";
import { FaArrowLeft } from "react-icons/fa"; // Icon for the back button
import { FaMapMarkerAlt } from "react-icons/fa"; // Icon for location
import Header from "../../components/header";

const Booked = () => {
  return (
    <div className="h-screen w-screen bg-gray-50">
      {/* Header */}
      <Header />

      <section className="p-6 md:p-12">
        {/* Back Button */}
        <div className="flex items-center mb-4 cursor-pointer">
          <FaArrowLeft className="text-lg mr-2" />
          <span className="text-sm font-medium">Back</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-semibold mb-8">
          You have successfully rented a car!
        </h1>

        {/* Booking Details */}
        <div className="   flex flex-col md:flex-row justify-between items-center">
          {/* Left Section - Booking Info */}
          <div className="bg-gray-50 p-9 rounded-lg shadow-md flex flex-col space-y-4 md:w-1/2">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">Honda Civic</h2>
                <p className="text-gray-500">8286879</p>
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <FaMapMarkerAlt className="mr-2" />
                <span>Abuja Continental Hotel</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-gray-700 mt-4">
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
            <div className="flex space-x-4 mt-4">
              <button className="bg-purple-500 text-white py-2 px-4 rounded-full font-medium">
                Details
              </button>
              <button className="text-purple-500 font-medium">See terms</button>
            </div>
          </div>

          {/* Right Section - Car Image */}
          <div className="relative mt-8 md:mt-0">
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

export default Booked;
