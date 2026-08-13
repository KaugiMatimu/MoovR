import React, { useState } from "react";
import { FaChevronUp } from "react-icons/fa";
import { Link } from "react-router-dom";

const PaymentDropdown = ({
  onCreatePackage,
  selectedPayment,
  setSelectedPayment,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelectPayment = (paymentMethod) => {
    setSelectedPayment(paymentMethod);
    setIsDropdownOpen(false);
  };

  const handleButtonClick = () => {
    onCreatePackage();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-80 flex flex-col items-center gap-3 relative">
      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="bg-white w-full rounded-lg shadow-lg mb-2 absolute bottom-[120px]">
          <ul className="flex flex-col">
            <li
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectPayment("MoovR Wallet")}
            >
              <img
                src="/icons/header/wallet.svg"
                alt="MoovR Wallet"
                className="w-6 h-6 mr-3"
              />
              <span>MoovR Wallet</span>
            </li>
            <li
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectPayment("Cash")}
            >
              <img
                src="/icons/ride/cash.svg"
                alt="Cash"
                className="w-6 h-6 mr-3"
              />
              <span>Cash</span>
            </li>
            <li
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectPayment("Debit Card")}
            >
              <img
                src="/images/mastercard.svg"
                alt="Debit Card"
                className="w-6 h-6 mr-3"
              />
              <span>Debit Card</span>
            </li>
            <li
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectPayment("Paystack")}
            >
              <img
                src="/images/mastercard.svg"
                alt="Paystack"
                className="w-6 h-6 mr-3"
              />
              <span>Paystack</span>
            </li>
          </ul>
        </div>
      )}

      {/* Payment Selector */}
      <div
        className="flex items-center space-x-3 cursor-pointer"
        onClick={toggleDropdown}
      >
        {selectedPayment === "MoovR Wallet" && (
          <img
            src="/icons/header/wallet.svg"
            alt="MoovR Wallet"
            className="w-8 h-8"
          />
        )}
        {selectedPayment === "Cash" && (
          <img src="/icons/ride/cash.svg" alt="Cash" className="w-8 h-8" />
        )}
        {selectedPayment === "Debit Card" && (
          <img
            src="/images/mastercard.svg"
            alt="Debit Card"
            className="w-8 h-8"
          />
        )}
        {selectedPayment === "Paystack" && (
          <img
            src="/images/mastercard.svg"
            alt="Paystack"
            className="w-8 h-8"
          />
        )}
        <span className="font-semibold">{selectedPayment}</span>
        <FaChevronUp
          className={`w-4 h-4 transform ${
            isDropdownOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {/* Action Button */}
      <div className="w-full ">
        <button
          onClick={handleButtonClick}
          className="bg-purple-500 w-full text-white py-3 px-4 rounded-full text-sm font-semibold hover:bg-purple-600"
        >
          Select MoovR
        </button>
      </div>
    </div>
  );
};

export default PaymentDropdown;
