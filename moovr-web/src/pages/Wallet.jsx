import React from "react";
import {
  FaArrowLeft,
  FaEyeSlash,
  FaGoogle,
  FaApple,
  FaCcMastercard,
} from "react-icons/fa"; // Icons for payment methods

const Wallet = () => {
  return (
    <section className="p-6 md:p-12">
      {/* Back Button */}
      <div className="flex items-center mb-4 cursor-pointer">
        <FaArrowLeft className="text-lg mr-2" />
        <span className="text-sm font-medium">Wallet</span>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 space-y-6 md:space-y-0 md:space-x-6">
        {/* Wallet Balance Card */}
        <div className="bg-purple-50 p-6 rounded-lg shadow-md w-full md:w-1/2 relative">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-500">
              Available balance
            </h2>
            <img
              src="/images/user-avatar.png" // Replace with the path to the user's avatar image
              alt="User Avatar"
              className="h-8 w-8 rounded-full"
            />
          </div>
          <p className="text-3xl font-semibold text-gray-900 my-4">₦1050</p>
          <div className="flex items-center text-gray-400">
            <FaEyeSlash className="mr-2" />
            <span className="text-xs">Tap to hide balance</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Payment Methods
          </h3>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <FaGoogle className="text-xl text-gray-600" />
              <span className="text-sm">Google Pay</span>
            </div>
            <div className="flex items-center space-x-3">
              <FaApple className="text-xl text-gray-600" />
              <span className="text-sm">Apple Pay</span>
            </div>
            <div className="flex items-center space-x-3">
              <FaCcMastercard className="text-xl text-gray-600" />
              <span className="text-sm">Mastercard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Transactions
        </h3>
        <div className="space-y-4">
          {[
            {
              type: "Payout for a ride",
              time: "9:54AM",
              amount: "-₦10",
              color: "text-red-500",
            },
            {
              type: "Payout for a ride",
              time: "2:30PM",
              amount: "-₦100",
              color: "text-red-500",
            },
            {
              type: "Cash added",
              time: "05/09/2024",
              amount: "+₦50",
              color: "text-green-500",
            },
            {
              type: "Payout for a ride",
              time: "05/09/2024",
              amount: "-₦100",
              color: "text-red-500",
            },
          ].map((transaction, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-md"
            >
              <div className="flex items-center space-x-2">
                <img
                  src="/icons/transaction-icon.png" // Replace with your transaction icon path
                  alt="Transaction Icon"
                  className="h-6 w-6"
                />
                <div>
                  <p className="text-sm font-medium">{transaction.type}</p>
                  <p className="text-xs text-gray-500">{transaction.time}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${transaction.color}`}>
                {transaction.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Wallet;
