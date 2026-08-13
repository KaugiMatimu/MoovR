import React, { useState } from "react";
import Header from "../../components/header"; // Import your Header component
import { BiArrowBack } from "react-icons/bi";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const CarDetail = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("Debit Card");

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelectPayment = (paymentMethod) => {
    setSelectedPayment(paymentMethod);
    setIsDropdownOpen(false);
  };

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

        {/* Car Details Card */}
        <div className="grid grid-cols-3 gap-6 bg-white rounded-2xl shadow-md p-6 mb-8">
          {/* Car Details */}
          <div>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Honda Civic</h2>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                <img src="/icons/ride/map-pin.svg" alt="" />
                <span>Abuja, Nigeria</span>
              </div>
            </div>
            <p className="text-primaryGray/50 mt-2">82BG879</p>
            <p className="text-primaryGray/50 mt-4">
              Experience the thrill of driving a Honda Civic, where luxury meets
              performance. Perfect for those who crave style and excitement on
              every journey.
            </p>
          </div>

          <div></div>

          {/* Specifications */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Specifications</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-babyPurple  p-5 space-y-4 rounded-lg text-center">
                <img
                  src="/icons/ride/seats.svg"
                  alt=""
                  className="h-[20px] w-auto mx-auto"
                />
                <p className="font-medium">4 Seats</p>
              </div>
              <div className="bg-babyPurple  p-5 space-y-4 rounded-lg text-center">
                <img
                  src="/icons/ride/gears.svg"
                  alt=""
                  className="h-[20px] w-auto mx-auto"
                />
                <p className="font-medium">Auto</p>
              </div>
              <div className="bg-babyPurple  p-5 space-y-4 rounded-lg text-center">
                <img
                  src="/icons/ride/speedometer.svg"
                  alt=""
                  className="h-[20px] w-auto mx-auto"
                />
                <p className="font-medium">400Km/h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rental Price Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center">
          <div className="relative w-1/3">
            <div
              className=" px-4 py-3 space-y-4 bg-white cursor-pointer"
              onClick={toggleDropdown}
            >
              <div className="flex justify-between">
                <h3 className="text-[16px] text-primaryGray">Rental Price</h3>
                <span className="flex items-end gap-[.5px]">
                  <p className="text-[13px] text-primaryGray mb-1 font-bold">
                    ₦
                  </p>
                  <p className="text-[20px] text-primaryGray font-bold">50</p>
                  <p className="text-[10px] text-primaryGray/50 mb-1">/hour</p>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {selectedPayment === "Debit Card" && (
                    <img
                      src="/images/mastercard.svg"
                      alt="Debit Card"
                      className="w-6 h-6"
                    />
                  )}
                  {selectedPayment === "Cash" && (
                    <img
                      src="/icons/ride/cash.svg"
                      alt="Cash"
                      className="w-6 h-6"
                    />
                  )}
                  {selectedPayment === "MoovR Wallet" && (
                    <img
                      src="/icons/header/wallet.svg"
                      alt="MoovR Wallet"
                      className="w-6 h-6"
                    />
                  )}
                  <span className="font-medium text-gray-700">
                    {selectedPayment}
                  </span>
                </div>
                {!isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>

            {isDropdownOpen && (
              <ul className="absolute bottom-12 w-full mb-2 bg-white border rounded-lg shadow-md">
                <li
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectPayment("Debit Card")}
                >
                  <img
                    src="/images/mastercard.svg"
                    alt="Debit Card"
                    className="w-5 h-5 mr-2"
                  />
                  <span>Debit Card</span>
                </li>
                <li
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectPayment("Cash")}
                >
                  <img
                    src="/icons/ride/cash.svg"
                    alt="Cash"
                    className="w-5 h-5 mr-2"
                  />
                  <span>Cash</span>
                </li>
                <li
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectPayment("MoovR Wallet")}
                >
                  <img
                    src="/icons/header/wallet.svg"
                    alt="MoovR Wallet"
                    className="w-5 h-5 mr-2"
                  />
                  <span>MoovR Wallet</span>
                </li>
              </ul>
            )}
          </div>

          <button className="bg-purple-500 text-white py-3 px-12 rounded-full w-1/3 text-lg font-medium hover:bg-purple-600">
            Rent a Car
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
