import React, { useState, useEffect } from "react";
import Header from "../../../components/user-panel/header"; // Import your Header component
import DriverCard from "../../../components/user-panel/driver-booking-card"; // Import DriverCard
import { BiArrowBack } from "react-icons/bi";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { BaseURL } from "../../../utils/BaseURL";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom"

const DriverBooking = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [drivers, setDrivers] = useState([]); // Stores the driver data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [serverMessage, setServerMessage] = useState(""); // Server message

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Fetch drivers data from the API
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        setError(null);
        setServerMessage("");

        const token = localStorage.getItem("token"); // Get token from localStorage
        console.log("your token is here :",token);
        if(!token){
          toast.error("token is required for driver booking")
        }

        const response = await fetch(`${BaseURL}/auth/drivers/available`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "", // Use token if available
          },
        });

        const data = await response.json();
        console.log("data is here", data.availableDrivers);

        if (!response.ok) {
          // setError(`Error: ${response.status} ${data.message}`);
          setError(`${data.message}`);
          setServerMessage(
            data.message || "An error occurred while fetching data."
          );
          setDrivers([]); // Clear the drivers if an error occurs
          return;
        }

        // Set the drivers data from the API response
        setDrivers(data.availableDrivers || []);
        setServerMessage(data.message || "Drivers fetched successfully.");
      } catch (err) {
        setError("An unexpected error occurred.");
        setServerMessage(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  // Show loading spinner while fetching data
  if (loading) {
    return <div>Loading...</div>;
  }

  const handleRoutesChange = ()=>{
    navigate("/ride")
  }


  return (
    <div className="h-full w-full">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="p-6">
        {/* Back Button */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center mb-4 hover:bg-gray-100 cursor-pointer py-2 px-3 rounded-[12px] w-fit">
            <button onClick={handleRoutesChange}>
              <BiArrowBack size={23} />
            </button>
            
          </div>
          {/* Dropdown Button */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center justify-between px-4 py-2 bg-purple-100 text-purple-500 rounded-full shadow-sm"
            >
              Options
              {isDropdownOpen ? (
                <FaChevronUp className="ml-2" />
              ) : (
                <FaChevronDown className="ml-2" />
              )}
            </button>
          </div>
        </div>

        {/* Show Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700">
            {error}
          </div>
        )}

        {/* Display Drivers */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 justify-center">
          {drivers.length > 0 ? (
            drivers?.map((driver, index) => (
              <DriverCard
                key={index}
                id={driver._id}
                name={`${driver.firstName} ${driver.lastName}`}
                rating={driver.reviews?.length || 0}
                price={driver.hourlyPrice || 0}
                availability={
                  driver.availability ? "Available" : "Not Available"
                }
                carTypes={driver.carCategory ? [driver.carCategory] : []}
                profilePicture={driver.profilePicture}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No drivers available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverBooking;
