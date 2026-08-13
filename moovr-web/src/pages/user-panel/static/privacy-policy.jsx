import React from "react";
import Header from "../../../components/user-panel/header"; // Import your pre-built header component
import { BiArrowBack } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white text-start text-gray-700">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex gap-3 items-center mb-8 cursor-pointer py-2 px-3 rounded-[12px] w-fit hover:bg-gray-100"
        >
          <BiArrowBack size={23} /> Back
        </button>
        <h1 className="text-2xl font-semibold">MoovR Privacy Policy</h1>
        <p className="mt-2">
          <strong>Effective Date:</strong> October 5, 2024
        </p>
        <p className="mt-4">
          MoovR ("we," "our," or "us") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you use our mobile application (the
          "App"). Please read this Privacy Policy carefully. If you do not agree
          with the terms of this Privacy Policy, please do not access the App.
        </p>

        <h2 className="mt-6 text-xl font-semibold">Information We Collect</h2>
        <ul className="list-disc pl-5 mt-2">
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

        <h2 className="mt-6 text-xl font-semibold">
          How We Use Your Information
        </h2>
        <ul className="list-disc pl-5 mt-2">
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

        <h2 className="mt-6 text-xl font-semibold">Sharing Your Information</h2>
        <p className="mt-2">
          We may share your information with third parties for the following
          purposes:
        </p>
        <ul className="list-disc pl-5 mt-2">
          <li>To comply with legal obligations.</li>
          <li>To service providers to facilitate our services.</li>
          <li>To protect and defend our rights and property.</li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold">
          Security of Your Information
        </h2>
        <p className="mt-2">
          We use administrative, technical, and physical security measures to
          help protect your information.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
