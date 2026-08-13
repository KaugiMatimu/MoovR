"use client";

import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BaseURL } from "../../utils/BaseURL";
import { Navigate, useNavigate  } from "react-router-dom";
import Cookies from "js-cookie"; // or use localStorage if you're not using cookies

export default function VehicleRegistration() {
  const navigate = useNavigate()
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleConfirm = async () => {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput?.files[0];
    const ownerName = document.getElementById("ownerName")?.value;
    const registrationNumber = document.getElementById("registrationNumber")?.value;
    const vehicleModel = document.getElementById("vehicleModel")?.value;
    const registrationDate = document.getElementById("registrationDate")?.value;
    const expiryDate = document.getElementById("expiryDate")?.value;

    if (!file || !ownerName || !registrationNumber || !vehicleModel || !registrationDate || !expiryDate) {
      toast.error("Please fill all required fields and upload the file.");
      return;
    }

    const formData = new FormData();
    formData.append("documentType", "vehicleRegistrationBook");
    formData.append("ownerName", ownerName);
    formData.append("registrationNumber", registrationNumber);
    formData.append("vehicleMakeModel", vehicleModel);
    formData.append("registrationDate", registrationDate);
    formData.append("registrationExpiryDate", expiryDate);
    formData.append("file", file);

    try {
      const token = Cookies.get("token") || localStorage.getItem("token");

      const response = await fetch(`${BaseURL}/driver/upload-document`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Vehicle registration book uploaded successfully!");
        navigate("/d/")
        
      } else {
        toast.error("Vehicle registration upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred while uploading. Try again.");
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex wf items-center justify-center p-4">
      <div className="w-full max-w-[1180px] bg-white rounded-2xl shadow-md p-8 py-12 relative overflow-hidden">
        {/* Accent Image */}
        <div className="absolute top-0 right-0">
          <img src="/driver/vehicle-registration.svg" alt="decor" />
        </div>

        <div className="max-w-[600px] mx-auto">
          <h2 className="text-lg font-medium mb-8">Vehicle Registration Book</h2>

          <div className="grid grid-cols-2 gap-x-6 gap-y-9">
            {/* Input Fields */}
            {[
              { id: "ownerName", label: "Owner's name", placeholder: "Owner name" },
              { id: "registrationNumber", label: "Registration number", placeholder: "Vehicle registration number" },
              { id: "vehicleModel", label: "Vehicle make and model", placeholder: "Vehicle make and model" },
              { id: "registrationDate", label: "Registration date", type: "date" },
              { id: "expiryDate", label: "Expiry date", type: "date" },
            ].map(({ id, label, placeholder, type = "text" }) => (
              <div className="space-y-2" key={id}>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                  {label}
                </label>
                <input
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#8257E9] focus:border-[#8257E9]"
                />
              </div>
            ))}

            {/* File Upload */}
            <div className="space-y-2 col-span-2">
              <label htmlFor="uploadBook" className="block text-sm font-medium text-gray-700">
                Upload registration book
              </label>
              <div className="relative">
                <input
                  id="uploadBook"
                  placeholder="Upload from device"
                  value={selectedFileName}
                  readOnly
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#8257E9] focus:border-[#8257E9] cursor-pointer"
                  onClick={() => document.getElementById("fileInput")?.click()}
                />
                <FiUpload className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileInput}
                />
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="w-full mt-8 px-4 py-2 bg-primaryPurple text-white rounded-md shadow-sm hover:bg-[#7347d5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8257E9]"
          >
            Confirm
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
