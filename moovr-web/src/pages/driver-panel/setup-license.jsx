"use client";

import React, { useState } from "react";
import Header from "../../components/driver-panel/header";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { BaseURL } from "../../utils/BaseURL";
import Cookies from "js-cookie"; // You can replace this with localStorage if preferred

export default function SetupLicense() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleConfirm = async () => {
    if (!file) {
      toast.warn("Please upload a file before confirming.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const formData = new FormData();
    formData.append("documentType", "drivingLicense");
    formData.append("file", file);

    try {
      const token = Cookies.get("token"); // or use localStorage.getItem("token")

      const response = await fetch(`${BaseURL}/driver/upload-document`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          // Note: Don't set Content-Type when using FormData — browser will do it
        },
      });

      if (response.ok) {
        toast.success("License uploaded successfully!"
         
        );
        navigate("/d/");
      } else {
        const errorData = await response.json();
        toast.error(
          errorData?.message || "File upload failed. Please try again.",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("An error occurred while uploading the file.", {
        position: "top-right",
        autoClose: 3000,
      });
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

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            Driving License
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Upload a clear picture of your valid driving license.
          </p>

          {/* Upload Section */}
          <div
            className="border-2 border-dashed h-[230px] border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
            onClick={() => document.getElementById("file-input").click()}
          >
            <FaCloudUploadAlt className="text-gray-400 text-4xl mb-3" />
            <p className="text-gray-500 text-sm">
              {file ? file.name : "Upload Driving License"}
            </p>
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              tabIndex={-1}
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
