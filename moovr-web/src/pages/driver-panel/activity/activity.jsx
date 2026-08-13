import React, { useState, useEffect } from "react";
import Header from "../../../components/driver-panel/header";
import { BiArrowBack } from "react-icons/bi";
import { FaChevronDown, FaChevronUp, FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import { BaseURL } from "../../../utils/BaseURL";
import toast from "react-hot-toast";
import { DotLoader } from "react-spinners";
import { Link } from "react-router-dom";

const DriverActivity = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Available");
  const [priceValue, setPriceValue] = useState("");
  const [activeItemIndex, setActiveItemIndex] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`${BaseURL}/activity?page=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const sortedActivities = response?.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setActivities(sortedActivities);
      } catch (error) {
        toast.error("Failed to fetch activities. Please try again.");
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  const handleActivityClick = (index) => {
    setActiveItemIndex(index === activeItemIndex ? null : index);
  };

  const handleDeleteActivity = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${BaseURL}/activity/hide/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setActivities((prev) => prev.filter((activity) => activity._id !== id));
      toast.success("Activity deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete activity. Please try again.");
      console.error("Error deleting activity:", error);
    }
  };

  // Group activities by date
  const groupedActivities = activities.reduce((acc, activity) => {
    const date = new Date(activity.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});

  const hasActivities = Object.keys(groupedActivities).length > 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center mb-4 hover:bg-gray-100 cursor-pointer py-2 px-3 rounded-[12px] w-fit">
           <Link to="/d/dashboard">
            <BiArrowBack size={23} />
           </Link>
            
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <DotLoader color="#A75AF2" />
          </div>
        ) : hasActivities ? (
          <div className="mt-8 space-y-6">
            {Object.entries(groupedActivities).map(([date, activities]) => (
              <div key={date}>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  {date}
                </h2>
                {activities.map((activity, index) => (
                  <ActivityItem
                    key={activity._id}
                    index={index}
                    isActive={activeItemIndex === index}
                    onClick={handleActivityClick}
                    onDelete={() => handleDeleteActivity(activity._id)}
                    text={activity.message}
                    time={new Date(activity.createdAt).toLocaleTimeString()}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 mt-16">
            <p className="text-lg">You have no activity yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Your recent activities will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ActivityItem = ({ index, isActive, onClick, onDelete, text, time }) => (
  <div className="relative">
    <button
      onClick={onDelete}
      className="absolute top-0 right-0 bottom-0 w-12 flex justify-center items-center bg-primaryPurple text-white rounded-r-lg"
    >
      <FaTrashAlt />
    </button>

    <div
      onClick={() => onClick(index)}
      className={`relative z-10 flex justify-between items-center duration-300 bg-white rounded-lg shadow-sm border-[1.4px] border-gray-100 p-4 transform ${
        isActive ? "-translate-x-10" : ""
      }`}
    >
      <div className="flex items-center space-x-4">
        <div>
          <p className="text-[16px]">{text}</p>
          <p className="text-gray-500 text-[14px]">{time}</p>
        </div>
      </div>
    </div>
  </div>
);

export default DriverActivity;
