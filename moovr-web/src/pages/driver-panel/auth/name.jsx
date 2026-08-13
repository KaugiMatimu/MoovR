import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const DriverName = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Retrieve existing userData from localStorage
    const userData = JSON.parse(localStorage.getItem("userData")) || {};

    // Update the userData object with new properties
    userData.firstName = firstName;
    userData.lastName = lastName;

    // Save updated userData back to localStorage
    localStorage.setItem("userData", JSON.stringify(userData));

    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);
    navigate("/d/earn");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[1180px] min-h-[500px] flex items-center bg-white rounded-2xl shadow-md p-8 relative overflow-hidden">
        {/* Bottom right curve */}
        <div className="absolute bottom-0 left-0 h-full">
          <img
            src="/driver/driver-bg-img-1.svg"
            alt=""
            className="h-full w-full object-contain "
          />
        </div>
        {/* Top left curve */}
        <div className="hidden lg:block absolute top-0 right-0 ">
          <img
            src="/driver/auth/welcome.svg"
            alt=""
            className="transform rotate-90"
          />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-[300px]">
          <h2 className="text-xl font-semibold mb-2">What's your name?</h2>
          <p className="text-gray-500 mb-6">
            Let us know how to properly address you.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border rounded-full bg-gray-100 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 border rounded-full bg-gray-100 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full py-3 mt-4 bg-purple-500 text-white rounded-full text-lg hover:bg-purple-600"
            >
              Done
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverName;
