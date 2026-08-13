import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../utils/BaseURL";
import toast from "react-hot-toast";

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${BaseURL}/driver/accept-terms`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Terms and conditions accepted!");
        
        // Update local userData
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        userData.termsAccepted = true;
        localStorage.setItem("userData", JSON.stringify(userData));
        
        navigate("/d/");
      }
    } catch (error) {
      console.error("Error accepting terms:", error);
      toast.error(error.response?.data?.message || "Failed to accept terms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white  rounded-lg max-w-7xl w-full p-8">
        <h1 className="text-xl font-bold mb-4">MoovR Terms and Conditions</h1>
        <p className="text-gray-700 text-sm mb-4">
          <strong>Effective Date:</strong> October 5, 2024
        </p>
        <p className="text-gray-700 text-sm mb-4">
          MoovR ("we," "our," or "us") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you use our mobile application (the
          "App"). Please read this Privacy Policy carefully. If you do not agree
          with the terms of this Privacy Policy, please do not access the App.
        </p>
        <h2 className="font-semibold text-lg mb-2">Information We Collect</h2>
        <ul className="text-gray-700 text-sm list-disc ml-6 mb-4">
          <li>
            <strong>Personal Data:</strong> We may collect personally
            identifiable information, such as your name, email address, and
            phone number, when you register for an account.
          </li>
          <li>
            <strong>Usage Data:</strong> We may collect information about your
            interactions with the App, such as the features you use and the time
            spent on the App.
          </li>
          <li>
            <strong>Location Data:</strong> We may collect your location data to
            provide location-based services.
          </li>
        </ul>
        <h2 className="font-semibold text-lg mb-2">
          How We Use Your Information
        </h2>
        <ul className="text-gray-700 text-sm list-disc ml-6 mb-4">
          <li>To provide and maintain our services.</li>
          <li>To notify you about changes to our services.</li>
          <li>
            To allow you to participate in interactive features of our App.
          </li>
          <li>To provide customer support.</li>
          <li>
            To gather analysis or valuable information so that we can improve
            our services.
          </li>
        </ul>
        <h2 className="font-semibold text-lg mb-2">Sharing Your Information</h2>
        <ul className="text-gray-700 text-sm list-disc ml-6 mb-4">
          <li>With service providers to facilitate our services.</li>
          <li>To comply with legal obligations.</li>
          <li>To protect and defend our rights and property.</li>
        </ul>
        <h2 className="font-semibold text-lg mb-2">
          Security of Your Information
        </h2>
        <p className="text-gray-700 text-sm mb-6">
          We use administrative, technical, and physical security measures to
          help protect your information.
        </p>
        <div className="w-full flex justify-center">
          <button 
            onClick={handleAccept}
            disabled={loading}
            className="w-fit px-20 text-center bg-purple-500 text-white py-3 rounded-full text-lg disabled:bg-purple-300"
          >
            {loading ? "Accepting..." : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
