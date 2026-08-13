import React from "react";
import Header from "../../../components/user-panel/header";
import { FaArrowLeft, FaStar, FaUserCircle } from "react-icons/fa";

const Details = () => {
  return (
    <div className="h-screen w-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Section */}
      <section className="p-6 md:p-12">
        {/* Back Button */}
        <div className="flex items-center mb-4 cursor-pointer">
          <FaArrowLeft className="text-lg mr-2" />
          <span className="text-sm font-medium">Details</span>
        </div>

        {/* Details Card */}
        <main className="w-full max-w-2xl bg-white border border-gray-300 rounded-2xl p-6 ">
          {/* Ride Date and Time */}
          <p className="text-lg font-semibold text-gray-800">
            Wed Sep 05, 5:30PM
          </p>

          {/* Pickup and Destination Info */}
          <div className="mt-4">
            <div className="flex items-center gap-5">
              <p className="text-gray-700 font-medium">
                Police Training School Ikeja
              </p>
              <img src="/icons/general/connector.svg" alt="Route" />
              <p className="text-gray-700 font-medium">Ikeja Fire Station</p>
            </div>
            <p className="mt-2 text-start text-sm text-gray-500">
              Pickup at 5:30PM
            </p>
          </div>

          {/* Ride Details */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center space-x-2">
                <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden border border-primaryPurple shadow-lg flex items-center justify-center">
                  <FaUserCircle className="w-full h-full text-gray-400 bg-white" />
                </div>
                <div className="absolute -bottom-2 -left-4 transform translate-x-2 bg-purple-100 text-purple-500 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <FaStar className="text-yellow-500 w-3 h-3" />
                  <span>4.9</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-gray-700 font-medium">MoovR X</p>
                <p className="text-sm text-start text-gray-500">Adewale</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-start">
                <p className="text-gray-700 font-medium">8286879</p>
                <p className="text-sm text-gray-500">Silver Honda Civic</p>
              </div>
              <button>
                <img
                  src="/icons/ride/chat.svg"
                  alt=""
                  className="h-[20px] w-[20px] object-cover"
                />
              </button>
              <button>
                <img
                  src="/icons/ride/call.svg"
                  alt=""
                  className="h-[20px] w-[20px] object-cover"
                />
              </button>
            </div>
          </div>

          {/* Price and Payment Method */}
          <div className="mt-6 border-t pt-4 border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-gray-700 font-medium">Price</p>
              <p className="text-gray-800 font-semibold">₦10</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <p className="text-gray-700 font-medium">Payment Method</p>
              <div className="flex items-center gap-2">
                <img
                  src="/icons/general/mastercard.svg"
                  alt="Payment Method"
                  className="w-6 h-6"
                />
                <p className="text-gray-700 font-medium">Debit Card</p>
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
};

export default Details;
