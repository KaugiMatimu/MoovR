import React, { useState } from "react";
import { FaStar, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../../utils/BaseURL";
import toast from "react-hot-toast";

const ReviewCard = ({ driverId, driverName, driverImage, path, rideId }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRating = (index) => {
    setRating(index);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }
    if (!comment) {
      toast.error("Please provide a feedback comment");
      return;
    }
    if (!rideId && !driverId) {
      toast.error("Driver or ride information missing");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = rideId
        ? `${BaseURL}/rides/rate/${rideId}`
        : `${BaseURL}/reviews`;
      const payload = rideId
        ? { rating, comment }
        : { rating, comment, driverId };

      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Review submitted! Thank you.");
      navigate(path || "/ride/thank-you");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-[430px] md:w-[430px] text-center space-y-6">
      {/* Title */}
      <h2 className="text-xl font-bold text-start text-gray-900">
        Ratings and Feedback
      </h2>

      {/* Driver Information */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {driverImage ? (
            <img
              src={driverImage}
              alt="Driver"
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="w-14 h-14 text-gray-400" />
          )}
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{driverName || "Driver"}</h3>
            <div className="flex items-center text-yellow-500">
              <FaStar className="w-4 h-4" />
              <span className="text-sm font-medium ml-1">4.9</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings */}
      <div className="flex justify-between items-center">
        <p className="text-gray-700 font-medium ">Give Ratings</p>
        <div className="flex justify-center space-x-2">
          {[...Array(5)].map((_, index) => {
            const starIndex = index + 1;
            return (
              <button
                type="button"
                key={starIndex}
                className={`text-3xl ${
                  starIndex <= (hover || rating)
                    ? "text-yellow-500"
                    : "text-gray-300"
                }`}
                onClick={() => handleRating(starIndex)}
                onMouseEnter={() => setHover(starIndex)}
                onMouseLeave={() => setHover(0)}
              >
                <FaStar />
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Text Area */}
      <textarea
        placeholder="Write your feedback here...."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full h-24 p-3 border border-gray-300 rounded-xl text-sm text-gray-600 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
      ></textarea>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-purple-500 text-white py-3 mt-3 w-full rounded-full text-lg font-semibold hover:bg-purple-600 disabled:bg-purple-300"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
};

export default ReviewCard;
