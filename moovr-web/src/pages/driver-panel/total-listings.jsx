"use client";

import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Header from "../../components/driver-panel/header";
import axios from "axios";
import { BaseURL } from "../../utils/BaseURL";

const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-lg shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

export default function TotalListings() {
  const [selectedOption, setSelectedOption] = useState("This Month");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [listingData, setListingData] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [totalListings, setTotalListings] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch car listings based on driverId
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const driverId = userData?._id;

        if (driverId) {
          const response = await axios.get(
            `${BaseURL}/cars/driver/${driverId}/cars`
          );
          const cars = response.data.cars || [];

          // Update the total number of listings and categorize data
          setTotalListings(cars.length);

          const activeCount = cars.filter(
            (car) => car.status === "active"
          ).length;
          const inactiveCount = cars.filter(
            (car) => car.status === "inactive"
          ).length;
          const removedCount = cars.filter(
            (car) => car.status === "removed"
          ).length;

          setListingData([
            {
              name: "Active",
              value: activeCount,
              color: "#8B5CF6",
              bgColor: "#EDE9FE",
            },
            {
              name: "Inactive",
              value: inactiveCount,
              color: "#4C1D95",
              bgColor: "#F3E8FF",
            },
            {
              name: "Removed",
              value: removedCount,
              color: "#EF4444",
              bgColor: "#FEE2E2",
            },
          ]);

          // Extract recent listings (using the first 3 as recent)
          const recent = cars.slice(0, 3).map((car) => ({
            id: car._id,
            name: car.vehicleName,
            date: new Date(car.createdAt).toLocaleDateString(),
            status: car.status.charAt(0).toUpperCase() + car.status.slice(1),
          }));
          setRecentListings(recent);
        }
      } catch (error) {
        console.error("Error fetching car listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <Header />

      <div className="p-6 max-w-6xl mx-auto">
        {/* Listing Stats */}
        <Card className="p-6 ">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Total Listings</h2>
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center px-4 py-2 bg-purple-100 text-purple-500 rounded-full shadow-sm"
              >
                {selectedOption}
                {isDropdownOpen ? (
                  <FaChevronUp className="ml-2" />
                ) : (
                  <FaChevronDown className="ml-2" />
                )}
              </button>
              {isDropdownOpen && (
                <div className="absolute top-12 right-0 w-40 bg-white shadow-lg rounded-lg mt-1">
                  <ul>
                    <li
                      onClick={() => handleOptionSelect("This Month")}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      This Month
                    </li>
                    <li
                      onClick={() => handleOptionSelect("Last Month")}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Last Month
                    </li>
                    <li
                      onClick={() => handleOptionSelect("This Year")}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      This Year
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex shadow-md justify-center items-center space-x-10 py-10 mt-8">
            {listingData.map((data, index) => (
              <div key={index} className="text-center">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { value: data.value, color: data.color },
                        {
                          value: totalListings - data.value,
                          color: data.bgColor,
                        },
                      ]}
                      dataKey="value"
                      outerRadius={80}
                      innerRadius={60}
                      startAngle={90}
                      endAngle={450}
                      isAnimationActive={true}
                    >
                      <Cell key="value" fill={data.color} />
                      <Cell key="bg" fill={data.bgColor} />
                    </Pie>
                    <text
                      x="50%"
                      y="45%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-lg font-bold"
                    >
                      {data.name}
                    </text>
                    <text
                      x="50%"
                      y="55%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xl mt-2 font-medium text-gray-700"
                    >
                      {data.value}
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Listings */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-gray-600">Loading...</div>
            ) : (
              recentListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex shadow-md border rounded-md border-gray-50 items-center justify-between p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-auto h-12">
                      <img
                        src="/images/BMW.png"
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{listing.name}</p>
                      <p className="text-sm text-gray-500">{listing.date}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      listing.status === "Active"
                        ? "bg-purple-100 text-purple-600"
                        : listing.status === "Inactive"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {listing.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
