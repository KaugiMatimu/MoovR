import React from "react";
import { FaArrowLeft } from "react-icons/fa"; // Icon for the back button
import { FaMapMarkerAlt } from "react-icons/fa"; // Icon for location
import Header from "../../../components/user-panel/header";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";

const Booked = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rental = location.state?.rental || {};
  
  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dayName} ${day}, ${hours}:${minutes}`;
  };

  return (
    <div className="h-screen text-start w-screen bg-gray-50">
      {/* Header */}
      <Header />

      <section className="max-w-[1180px] mx-auto p-6 ">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex gap-3 items-center mb-8 cursor-pointer py-2 px-3 rounded-[12px] w-fit hover:bg-gray-100"
        >
          <BiArrowBack size={23} /> Back
        </button>

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
                <h2 className="text-lg font-semibold">{rental.carName || "Car Name"}</h2>
                <p className="text-gray-500">{rental.carId || "Car ID"}</p>
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <FaMapMarkerAlt className="mr-2" />
                <span>{rental.deliveryLocation || "Location"}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-gray-700 mt-4">
              <div className="flex flex-col w-full text-center">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{formatDate(rental.rentStartDate)}</span>
                  <img src="/icons/rent/connection.svg" alt="" />
                  <span className="font-medium">{formatDate(rental.rentEndDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Rent start date/time</span>
                  <span className="text-xs">Rent end date/time</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-4 mt-4">
              <Link to="/rent/car/detail">
                <button className="bg-purple-500 text-white py-2 px-6 rounded-full font-medium">
                  Details
                </button>
              </Link>
              <button className="text-purple-500 font-medium">See terms</button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-gray-700">
                <strong>Payment Method:</strong> {rental.paymentMethod || "N/A"}
              </p>
              {rental.price && (
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Price:</strong> ₦{rental.price}/hour
                </p>
              )}
            </div>
          </div>

          {/* Right Section - Car Image */}
          <div className="relative mt-8 md:mt-0 w-1/2">
            <img
              src={rental.carImage || "/images/BMW.png"}
              alt="Rented Car"
              className="w-full max-w-xs mx-auto"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Booked;
