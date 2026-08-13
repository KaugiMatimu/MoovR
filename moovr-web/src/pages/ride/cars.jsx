import React, { useState } from "react";
import Header from "../../components/header"; // Import your Header component
import { BiArrowBack } from "react-icons/bi";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

// Sample data for cars
const cars = [
  {
    name: "Honda Civic",
    location: "Abuja, Nigeria",
    seats: 4,
    price: 10,
    image: "/images/BMW.png", // Replace with actual path
  },
  {
    name: "BMW M5",
    location: "Abuja, Nigeria",
    seats: 4,
    price: 50,
    image: "/images/BMW.png", // Replace with actual path
  },
  // Add more car objects as needed
];

const RentCars = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("All");
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
            <h1 className="text-lg font-semibold">Rent</h1>
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
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-4 flex flex-col "
            >
              <img
                src={cars[index % cars.length].image}
                alt={cars[index % cars.length].name}
                className="w-full h-40 object-cover mb-4"
              />
              <h2 className="font-semibold text-lg text-gray-800">
                {cars[index % cars.length].name}
              </h2>
              <div className="flex gap-2 pt-3 items-center">
                <img src="/icons/ride/map-pin.svg" />
                <p className="text-sm text-gray-500">
                  {cars[index % cars.length].location}
                </p>
              </div>
              <div className="flex items-center justify-between w-full mt-2">
                <div className="flex gap-2 items-center">
                  <img src="/icons/ride/seats.svg" alt="" />
                  <p className="text-gray-700">
                    {cars[index % cars.length].seats} seats
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <img src="/icons/ride/coins.svg" alt="" />
                  <p className="font-medium text-gray-900">
                    ₦{cars[index % cars.length].price}/h
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RentCars;
