"use client";

import axios from "axios";
import React, { useState } from "react";
import Header from "../../components/driver-panel/header";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BaseURL } from "../../utils/BaseURL";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

export default function SetupProfile() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleConfirm = async () => {
    if (!file) {
      toast.error("Please upload a file before confirming.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file); // ensure your backend expects 'image' key

      const token = Cookies.get("token"); // or use localStorage.getItem("token") if preferred

      const response = await axios.put(
        `${BaseURL}/auth/update-user/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Profile updated successfully");
      console.log("Response:", response.data);
      navigate("/d/");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="w-full">
        <Header />
      </div>

      <div className="w-full max-w-5xl mx-auto mt-12 bg-white shadow-lg rounded-lg p-8">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Logo" className="h-12" />
          </div>

          {/* Content */}
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            Profile picture
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Upload a high-quality picture where your face is clearly visible.
          </p>

          {/* File Upload */}
          <div
            className="border-2 border-dashed h-[230px] border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
            onClick={() => document.getElementById("file-input").click()}
          >
            <FaCloudUploadAlt className="text-gray-400 text-4xl mb-3" />
            <p className="text-gray-500 text-sm">
              {file ? file.name : "Upload Profile Picture"}
            </p>
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg mt-6 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
