import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/user-panel/header";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { FaDownload } from "react-icons/fa";

const BillDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bill } = location.state || {};
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = user?.firstName || "Passager";

  useEffect(() => {
    if (!bill) {
      toast.error("you do not have any bill yet!")
      navigate("/d/dashboard"); // Redirect if bill is missing
    }
  }, [bill, navigate]);

  if (!bill) {
    // Prevent render while redirecting
    return null;
  }

  return (
    <div className="h-screen w-screen">
      {/* Header */}
      <Header />

      <div className="p-6 md:p-12">
        {/* Purple Banner */}
        <div className="bg-purple-600 rounded-lg w-full flex flex-col md:flex-row items-center justify-between text-white">
          <div className="p-12 space-y-2">
            <p className="text-sm">
              {bill.createdAt
                ? format(new Date(bill.createdAt), "dd/MM/yyyy")
                : "Invalid Date"}
            </p>
            <h2 className="text-[24px] font-semibold mt-2">
              Here is your receipt
            </h2>
            <h2 className="text-[24px] font-semibold">for your ride,</h2>
            <h2 className="text-[24px] font-semibold">{firstName}</h2>
          </div>
          <img
            src="/images/BMW.png"
            alt="Car"
            className="h-[278px] w-auto mt-4 md:mt-0"
          />
        </div>

        {/* Bill Details Card */}
        <div className="bg-white mt-9 rounded-lg shadow-lg border-[1.8px] border-gray-100 p-6 max-w-sm">
          {/* Download Button */}
          <div className="flex justify-end items-start">
            <button className="text-gray-800 hover:text-black">
              <FaDownload className="h-5 w-5" />
            </button>
          </div>

          {/* Total */}
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">Total</p>
            <h2 className="text-3xl font-bold text-gray-800">₦{bill.fare}</h2>
          </div>

          {/* Details */}
          <div className="mt-9 space-y-9 text-sm justify-between w-full text-gray-600">
            <div className="space-y-3 text-center">
              <p className="font-medium">Reference number</p>
              <p className="text-black">{bill.id}</p>
            </div>
            <div className="grid grid-cols-3 gap-y-4 gap-7">
              <div className="space-y-3">
                <p className="font-medium">Date</p>
                <p className="text-black">
                  {bill.createdAt
                    ? format(new Date(bill.createdAt), "dd/MM/yyyy")
                    : "Invalid Date"}
                </p>
              </div>
              <div className="space-y-3">
                <p className="font-medium">Trip charges</p>
                <p className="text-black">₦{bill.fare}</p>
              </div>
              <div className="space-y-3">
                <p className="font-medium">Payment</p>
                <div className="flex items-center space-x-2">
                  <img src="/icons/general/google.svg" className="h-4" alt="Google Pay" />
                  <p className="text-black">{bill.paymentType}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default BillDetails;
