"use client";

import React, { useState, useEffect } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Header from "../../components/driver-panel/header";
import { DotLoader } from "react-spinners";
import { BaseURL } from "../../utils/BaseURL";

// Button component
const Button = ({ children, className = "", ...props }) => (
  <button className={`px-4 py-2 rounded-md ${className}`} {...props}>
    {children}
  </button>
);

// Card component
const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-lg shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

export default function Revenue() {
  const [selectedOption, setSelectedOption] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [priceValue, setPriceValue] = useState("");
  const [weeklyRevenue, setWeeklyRevenue] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  const getRevenueValue = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  // Fetch revenue data on mount
  useEffect(() => {
    const fetchRevenueData = async () => {
      const token = localStorage.getItem("token"); // Get token from localStorage
      if (!token) {
        console.log("Token not found in localStorage");
        return;
      }

      try {
        setLoading(true); // Set loading to true before the API call
        const response = await fetch(`${BaseURL}/revenue`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setWeeklyRevenue(data);
        const totalValue = getRevenueValue(data?.totalRevenue ?? data?.Total ?? data?.total ?? data?.totalRevenueAmount);
        const totalFromDays = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].reduce((sum, day) => sum + getRevenueValue(data?.[day]), 0);
        setTotalRevenue(Math.max(totalValue, totalFromDays));
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false); // Set loading to false after the data is fetched
      }
    };

    fetchRevenueData();
  }, []);

  // Check if the data is loaded
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <DotLoader size={60} color="#4B6EEC" />
      </div>
    );
  }

  // Prepare data for the chart
  const chartData = [
    { day: "Mon", value: getRevenueValue(weeklyRevenue?.Monday) },
    { day: "Tue", value: getRevenueValue(weeklyRevenue?.Tuesday) },
    { day: "Wed", value: getRevenueValue(weeklyRevenue?.Wednesday) },
    { day: "Thu", value: getRevenueValue(weeklyRevenue?.Thursday) },
    { day: "Fri", value: getRevenueValue(weeklyRevenue?.Friday) },
    { day: "Sat", value: getRevenueValue(weeklyRevenue?.Saturday) },
    { day: "Sun", value: getRevenueValue(weeklyRevenue?.Sunday) },
  ];

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <Header />

      {/* Revenue Card */}
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Total Revenue</h2>
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
              {/* {isDropdownOpen && (
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
              )} */}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-4xl font-bold text-gray-900">₦{totalRevenue}</p>
            <p className="text-sm text-gray-500">Driver total revenue</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={0}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  tickMargin={0}
                />
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#C084FC" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#C084FC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#colorGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

{
  /* <div> */
}
// <h3 className="text-lg text-start font-[600] text-gray-800 mt-4 my-4">
//   Recent Transactions
// </h3>
// <div className="space-y-4">
//   {/* Map recent transactions here, you can dynamically pull these from your API */}
//   {recentRides.map((transaction, index) => (
//     <div
//       key={index}
//       className="flex items-center justify-between p-7 bg-gray-50 rounded-lg shadow-md"
//     >
//       <div className="flex items-center space-x-2">
//         <div>
//           <p className="text-sm font-medium">Payout for a ride</p>
//         </div>
//       </div>
//       <p className="text-xs text-gray-500">{transaction.date}</p>
//       <span className="text-sm font-semibold text-green-500">
//         +₦{transaction.amount}
//       </span>
//     </div>
//   ))}
// </div>
// </div>;
//   </div>
