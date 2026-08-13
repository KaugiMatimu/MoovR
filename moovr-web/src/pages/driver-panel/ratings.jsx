"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Tooltip,
  ResponsiveContainer as ResponsiveBarContainer,
} from "recharts";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Header from "../../components/driver-panel/header";
import { FaStar, FaUserCircle } from "react-icons/fa";
import { BaseURL } from "../../utils/BaseURL";

const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-lg shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

export default function Revenue() {
  const [selectedOption, setSelectedOption] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [priceValue, setPriceValue] = useState("");
  const [reviewsData, setReviewsData] = useState([]); // State to store reviews
  const [averageRating, setAverageRating] = useState(0); // State for average rating
  const [ratingTrend, setRatingTrend] = useState([]); // State for rating trend

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  // Fetch reviews data dynamically
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(`${BaseURL}/reviews`, config);
        const { reviews, averageRating } = response.data;
        console.log(reviews, averageRating);

        setReviewsData(reviews); // Set reviews data
        setAverageRating(averageRating); // Set average rating

        // Calculate rating trend (You can adjust this logic as needed)
        const trend = calculateRatingTrend(reviews);
        setRatingTrend(trend);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  // Calculate the rating trend (for the last 7 days)
  const calculateRatingTrend = (reviews) => {
    const trend = [
      { day: "Sun", count: 0 },
      { day: "Mon", count: 0 },
      { day: "Tue", count: 0 },
      { day: "Wed", count: 0 },
      { day: "Thu", count: 0 },
      { day: "Fri", count: 0 },
      { day: "Sat", count: 0 },
    ];

    reviews.forEach((review) => {
      const date = new Date(review.createdAt);
      const dayOfWeek = date.getDay(); // Get the day index (0 - Sunday, 6 - Saturday)
      trend[dayOfWeek].count += 1; // Increase the count for the respective day
    });

    return trend;
  };

  // Calculate the overall percentage
  const overallPercentage = (averageRating / 5) * 100;

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

          <div className="h-[300px]">
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Overall Ratings */}
              <Card className="border border-gray-200 shadow-lg p-8 flex flex-col justify-center items-center">
                <h3 className="text-lg font-medium mb-2">Overall Ratings</h3>
                <img src="/driver/stars.svg" alt="" />
                <p className="text-3xl font-bold text-gray-700">
                  {averageRating}
                </p>
                <p className="text-gray-500">
                  Rated by {reviewsData.length} people
                </p>
              </Card>

              {/* Ratings Percentage */}
              <Card className="border border-gray-200 shadow-lg p-8">
                <h3 className="text-lg font-medium text-center mb-4">
                  Ratings Percentage
                </h3>
                <div className="flex justify-center">
                  <ResponsiveContainer width={150} height={150}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            value: overallPercentage,
                            color: "#8B5CF6",
                          },
                          {
                            value: 100 - overallPercentage,
                            color: "#F3E8FF",
                          },
                        ]}
                        dataKey="value"
                        innerRadius={50}
                        outerRadius={70}
                        startAngle={90}
                        endAngle={450}
                      >
                        <Cell key="value" fill="#8B5CF6" />
                        <Cell key="bg" fill="#F3E8FF" />
                      </Pie>
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xl font-bold"
                      >
                        {Math.round(overallPercentage)}%
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Ratings Trend */}
              <Card className="border border-gray-200 shadow-lg p-8">
                <h3 className="text-lg font-medium text-center mb-4">
                  Ratings Trend
                </h3>
                <ResponsiveBarContainer width="100%" height={150}>
                  <BarChart data={ratingTrend}>
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#4B5563", fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveBarContainer>
              </Card>
            </div>
          </div>
        </Card>

        {/* Recent Transactions */}
        <div>
          <h3 className="text-lg text-start font-[600] text-gray-800 mt-4 my-4">
            Recent Transactions
          </h3>
          <div className="space-y-4">
            {reviewsData.map((review, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-7 bg-gray-50 rounded-lg shadow-md"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex gap-3 items-center">
                    <div>
                      {review.reviewer?.profilePicture ? (
                        <img
                          src={review.reviewer.profilePicture}
                          alt=""
                          className="rounded-full h-12 w-12 object-cover"
                        />
                      ) : (
                        <FaUserCircle className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm font-medium">
                      {review.reviewer?.firstName} {review.reviewer?.lastName}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{review.createdAt}</p>
                <p className="text-xs text-gray-500">{review.comment}</p>
                <span className={`text-md font-semibold`}>
                  {review.rating}.0
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
