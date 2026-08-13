import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { BaseURL } from "../../../utils/BaseURL";
import Cookies from "js-cookie";


const Name = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get userData from localStorage
    const userData = JSON.parse(localStorage.getItem("userData"));

    if (!userData || !userData.phone) {
      toast.error("Phone number not found. Please try again.");
      console.error("User data or phone is missing in localStorage");
      return;
    }

    const { phone } = userData;

    // Prepare the data to send
    const payload = {
      firstName,
      lastName,
      role: "user",
      phone,
    };

    try {
      // API call
      const response = await axios.post(`${BaseURL}/auth/register`, payload);

      if (response.status === 200) {
        toast.success("Registration successful!");

        const { token, user } = response.data;
        const role = user.role || "user";

        console.log("your response from the user registration name page is :", response);

        Cookies.set("token", token, { expires: 7, path: "/" });
        Cookies.set("role", role, { expires: 7, path: "/" });
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("userData", JSON.stringify(user));

        console.log("your user token is :", token);
        console.log("your user role is :", role);
        navigate("/ride"); // Navigate to the rides page
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-8 text-center">
        <img
          src="/images/logo.svg"
          alt="Logo"
          className="mx-auto mb-6 w-20 h-20"
        />
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
  );
};

export default Name;
