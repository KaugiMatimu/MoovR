"use client";

import React, { useState } from "react";
import Header from "../../components/driver-panel/header";
import { FaCloudUploadAlt } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { BaseURL } from "../../utils/BaseURL";
import toast from "react-hot-toast";

export default function SetupAccount() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

 const handleConfirm = async () => {
  if (!file) {
    toast.error("Please upload a file before confirming.");
    return;
  }

  const formData = new FormData();
  formData.append("documentType", "proofOfResidency");
  formData.append("file", file);

  // ✅ Log each entry in formData
  for (let pair of formData.entries()) {
    console.log(`${pair[0]}:`, pair[1]);
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${BaseURL}/driver/upload-document`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type manually here!
      },
    });

    if (response.ok) {
      toast.success("Proof of residency uploaded successfully!");
      navigate("/d/");
    } else {
      const errorData = await response.json();
      toast.error(errorData?.message || "Failed to upload proof of residency. Please try again.");
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    toast.error("An error occurred while uploading the proof of residency.");
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
            Proof of Residency
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Upload the high-quality picture of Proof of Residency.
          </p>

          {/* File Upload */}
          <div
            className="border-2 border-dashed h-[230px] border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
            onClick={() => document.getElementById("file-input").click()}
          >
            <FaCloudUploadAlt className="text-gray-400 text-4xl mb-3" />
            <p className="text-gray-500 text-sm">
              {file ? file.name : "Upload Proof of Residency"}
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
