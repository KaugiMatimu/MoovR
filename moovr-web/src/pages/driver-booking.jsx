import React, { useState } from "react";
import Header from "../components/header"; // Import your Header component
import DriverCard from "../components/driver-booking-card"; // Import DriverCard
import { BiArrowBack } from "react-icons/bi";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const drivers = [
  {
    name: "Adewale",
    rating: 4.9,
    price: 7.8,
    availability: "Available",
    carTypes: ["Suv", "Sedan", "Mini"],
  },
  {
    name: "Josephine",
    rating: 4.9,
    price: 10,
    availability: "Available",
    carTypes: ["Suv", "Sedan"],
  },
];

const DriverBooking = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Available");
  const [priceValue, setPriceValue] = useState("");

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  return (
    <div className="h-full w-full">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center mb-4 hover:bg-gray-100 cursor-pointer py-2 px-3 rounded-[12px] w-fit">
            <BiArrowBack size={23} />
            <h1 className="text-lg font-semibold ">Driver Booking</h1>
          </div>
          <div className="relative">
            {/* Dropdown Button */}
            <button
              onClick={toggleDropdown}
              className="flex items-center justify-between px-4 py-2 bg-purple-100 text-purple-500 rounded-full shadow-sm"
            >
              {selectedOption}
              {isDropdownOpen ? (
                <FaChevronUp className="ml-2" />
              ) : (
                <FaChevronDown className="ml-2" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-12 right-0 w-56 bg-white shadow-lg rounded-lg mt-1 p-2">
                <ul className="flex flex-col">
                  <li
                    onClick={() => handleOptionSelect("All")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    All
                  </li>
                  <li
                    onClick={() => handleOptionSelect("Available")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Available
                  </li>
                  <li className="px-4 py-2 flex justify-between items-center gap-4">
                    <label className="">Price</label>
                    <input
                      type="text"
                      value={priceValue}
                      onChange={(e) => setPriceValue(e.target.value)}
                      placeholder="Price"
                      className="w-2/3 mt-1 px-2 py-1 bg-gray-100 rounded text-gray-500 focus:outline-none"
                    />
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 justify-center">
          {Array.from({ length: 12 }).map((_, index) => (
            <DriverCard
              key={index}
              name={drivers[index % drivers.length].name}
              rating={drivers[index % drivers.length].rating}
              price={drivers[index % drivers.length].price}
              availability={drivers[index % drivers.length].availability}
              carTypes={drivers[index % drivers.length].carTypes}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverBooking;
