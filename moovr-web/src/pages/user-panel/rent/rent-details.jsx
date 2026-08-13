import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import Header from "../../../components/user-panel/header";
import { useLocation, useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";

const RentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rental, setRental] = useState(() => {
    const fromState = location.state?.rental;
    if (fromState) return fromState;

    try {
      const storageValues = [
        JSON.parse(localStorage.getItem("latestRentDetails") || "null"),
        JSON.parse(sessionStorage.getItem("latestRentDetails") || "null"),
      ];

      return storageValues.find((value) => value && Object.keys(value).length > 0) || {};
    } catch (error) {
      return {};
    }
  });

  useEffect(() => {
    if (location.state?.rental) {
      setRental(location.state.rental);
    }

    if (location.state?.rental || rental) {
      const snapshot = JSON.stringify(location.state?.rental || rental);
      localStorage.setItem("latestRentDetails", snapshot);
      sessionStorage.setItem("latestRentDetails", snapshot);
    }
  }, [location.state, rental]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${dayName} ${day}, ${hours}:${minutes}`;
  };

  const imageSrc = rental.carImage || rental.image || "/images/BMW.png";

  return (
    <div className="h-screen w-screen bg-gray-50">
      <Header />

      <section className="max-w-[1180px] mx-auto p-6 ">
        <button
          onClick={() => navigate(-1)}
          className="flex gap-3 items-center mb-8 cursor-pointer py-2 px-3 rounded-[12px] w-fit hover:bg-gray-100"
        >
          <BiArrowBack size={23} /> Back
        </button>

        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="bg-gray-50 p-6 rounded-lg shadow-md w-full md:w-1/2 mb-8 md:mb-0">
            <div className="flex items-center justify-between ">
              <div>
                <h2 className="text-lg font-semibold">{rental.carName || rental.vehicleName || "Car Name"}</h2>
                <p className="text-gray-500 mb-2">{rental.carId || "Car ID"}</p>
              </div>
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <FaMapMarkerAlt className="mr-2" />
                <span>{rental.deliveryLocation || rental.pickupLocation || "Pickup location"}</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              {rental.description || "Your selected rental details are shown below."}
            </p>

            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Specifications
            </h3>
            <div className="flex space-x-4 mb-6">
              <div className="flex flex-col space-y-4 items-center justify-center h-[104px] w-[116px] bg-babyPurple rounded-lg">
                <img src="/icons/rent/seats.svg" alt="" />
                <span className="text-sm">{rental.seats || "4 Seats"}</span>
              </div>
              <div className="flex flex-col space-y-4 items-center justify-center h-[104px] w-[116px] bg-babyPurple rounded-lg">
                <img src="/icons/rent/gears.svg" alt="" />
                <span className="text-sm">{rental.transmission || "Auto"}</span>
              </div>
              <div className="flex flex-col space-y-4 items-center justify-center h-[104px] w-[116px] bg-babyPurple rounded-lg">
                <img src="/icons/rent/speedometer.svg" alt="" />
                <span className="text-sm">{rental.topSpeed || "400Km/h"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-gray-700 mb-6">
              <div className="flex flex-col text-center">
                <span className="font-medium">{formatDate(rental.rentStartDate)}</span>
                <span className="text-xs">Rent start date/time</span>
              </div>
              <img src="/icons/rent/connection.svg" alt="" />
              <div className="flex flex-col text-center">
                <span className="font-medium">{formatDate(rental.rentEndDate)}</span>
                <span className="text-xs">Rent end date/time</span>
              </div>
            </div>

            <div className="flex justify-between text-gray-700 mb-2">
              <span className="font-medium">Rental Price</span>
              <span className="text-lg font-semibold">
                {rental.price ? `₦${rental.price}` : "Price not available"}
              </span>
            </div>

            <div className="flex items-center mt-4">
              <img
                src="/images/mastercard.svg"
                alt="Payment method"
                className="h-6 w-auto mr-2"
              />
              <span className="text-sm font-medium">{rental.paymentMethod || "Payment method"}</span>
            </div>
          </div>

          <div className="relative w-full md:w-1/2">
            <img
              src={imageSrc}
              alt="Rented Car"
              className="w-full max-w-sm mx-auto"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default RentDetails;
