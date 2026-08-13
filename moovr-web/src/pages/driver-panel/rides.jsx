"use client";

import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import axios from "axios";
import Header from "../../components/driver-panel/header";
import { BaseURL } from "../../utils/BaseURL";
import { DotLoader } from "react-spinners"; // Import DotLoader

const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-lg shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

export default function TotalListings() {
  const [selectedOption, setSelectedOption] = useState("This Month");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [totalRides, setTotalRides] = useState(0);
  const [acceptedPercentage, setAcceptedPercentage] = useState(0);
  const [canceledPercentage, setCanceledPercentage] = useState(0);
  const [ridesData, setRidesData] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  // Fetch ride data
  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const { data } = await axios.get(`${BaseURL}/rides/driver`, config);
        console.log("rides", data);
        if (data && data.driverRides) {
          const rides = data.driverRides;
          const total = rides.length;

          const acceptedRides = rides.filter(
            (ride) => ride.status === "completed"
          ).length;
          const canceledRides = rides.filter(
            (ride) => ride.status === "canceled"
          ).length;

          setTotalRides(total || 0);

          const acceptedPct =
            total > 0 ? ((acceptedRides / total) * 100).toFixed(1) : 0;
          const canceledPct =
            total > 0 ? ((canceledRides / total) * 100).toFixed(1) : 0;

          setAcceptedPercentage(acceptedPct);
          setCanceledPercentage(canceledPct);

          setRidesData([
            { name: "Completed", value: acceptedRides, color: "#8257E9" },
            { name: "Canceled", value: canceledRides, color: "#4C1D95" },
          ]);

          // Set recent listings based on the rides data
          const recent = rides.slice(0, 3).map((ride) => ({
            id: ride._id,
            name: ride.vehicle_name, // Replace with correct field
            date: new Date(ride.createdAt).toLocaleDateString(), // Replace with correct date field
            status: ride.status,
            pickupLocation: ride.pickupLocation,
            fare: ride.fare,
          }));
          setRecentListings(recent);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchRides();
  }, []);

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <Header />

      <div className="p-6 max-w-6xl mx-auto">
        {/* Listing Stats */}
        <Card className="p-6 shadow-md">
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

          <div className="flex justify-center items-center space-x-10 mt-8">
            {ridesData.map((data, index) => (
              <div key={index} className="text-center">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { value: data.value, color: data.color },
                        { value: totalRides - data.value, color: "#F3E8FF" },
                      ]}
                      dataKey="value"
                      outerRadius={80}
                      innerRadius={60}
                      startAngle={90}
                      endAngle={450}
                      isAnimationActive={true}
                    >
                      <Cell key="value" fill={data.color} />
                      <Cell key="bg" fill="#F3E8FF" />
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
          <div>
            {loading ? (
              <div className="flex justify-center">
                <DotLoader color="#8257E9" size={60} />{" "}
                {/* Show loader while fetching data */}
              </div>
            ) : (
              recentListings.map((listing) => (
                <Card
                  key={listing.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-auto h-12">
                      <img
                        src="/images/BMW.png"
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      {/* Pickup Location */}
                      <p className="font-medium">{listing.pickupLocation}</p>

                      {/* Formatted Date */}
                      <p className="text-sm text-gray-500">{listing.date}</p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      listing.status === "completed"
                        ? "bg-purple-100 text-purple-600"
                        : listing.status === "canceled"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {listing.status}
                  </span>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
