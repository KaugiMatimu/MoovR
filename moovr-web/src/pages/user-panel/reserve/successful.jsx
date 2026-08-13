import React from "react";
import Header from "../../../components/user-panel/header";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const Successful = () => {
  return (
    <div className="h-screen  w-screen ">
      {/* Header */}
      <Header />
      <section className="p-6 md:p-12 ">
        {/* Back Button */}
        <div className="flex items-center mb-4  cursor-pointer">
          <FaArrowLeft className="text-lg mr-2" />
        </div>
        <main className="w-full max-w-2xl mt-3 mb-8">
          <h1 className="text-[32px] font-[600] text-gray-800 text-start">
            Your ride has been reserved!
          </h1>
          <p className="text-[16px] font-[600] text-start mt-12">Upcoming</p>
          <div className="mt-8 bg-white  border border-gray-300 rounded-[20px] p-6">
            <div>
              <p className="text-[16px] font-[600] text-start mt-1">
                Wed Sep 05, 5:30PM
              </p>
            </div>
            <div
              className="mt-4 flex flex-col items-start justify-start
            "
            >
              <div className="flex justify-between items-center w-[80%]">
                <p className="text-gray-700 font-medium">
                  Police Training School Ikeja
                </p>
                <img src="/icons/general/connector.svg" alt="" />
                <p className="text-gray-700 font-medium">Ikeja Fire Station</p>
              </div>
              <p className="mt-3 text-sm text-gray-500">Pickup at 5:30PM</p>
            </div>
            <div className="mt-4 flex items-center gap-6">
              <Link
                to={"/reserve/details"}
                className="text-[16px] px-6 mr-3 py-2 rounded-full bg-primaryPurple text-white font-[600] "
              >
                Details
              </Link>
              <button className="text-[16px] text-gray-600 hover:underline">
                See terms
              </button>
            </div>
          </div>
          <div className="mt-6 flex justify-center w-full max-w-sm">
            <button className="px-6 py-2 w-full bg-purple-500 text-white rounded-full hover:bg-purple-600">
              Reserve another ride
            </button>
          </div>
        </main>
      </section>
    </div>
  );
};

export default Successful;
