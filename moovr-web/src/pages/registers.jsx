import React, { useState, useEffect } from "react";
import { auth, sendOtp } from "../firebase";
import axios from "axios";
import { BaseURL } from "../utils/BaseURL";

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
    firstName: "",
    lastName: "",
    city: "",
    driverType: "",
    serviceType: "",
    carCategory: "",
    referralCode: "",
  });
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [error, setError] = useState("");

  // Dummy Token for API Authentication
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODNmNTY1MzEzNTVjMDY5OGViZDE1OSIsInBob25lIjoiKzkyMDAwMDAiLCJyb2xlIjoidXNlciIsImlhdCI6MTczNjcwMTMwMCwiZXhwIjoxNzM3OTk3MzAwfQ.hy2U2MUxXhXpf5iIhxKzsBG71isJGm9JAs0GQCSL4vM";

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Generate OTP and move to the next step
  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    setError(""); // Reset previous errors
    try {
      console.log("Attempting to send OTP via sendOtp helper (MultiStep)...");
      const confirmationResult = await sendOtp(formData.phone);

      // Store confirmationResult globally to access it in the verification page
      window.confirmationResult = confirmationResult;

      console.log("OTP sent via Firebase");

      setStep(2); // Move to the next step
    } catch (err) {
      const errorMessage = err.message || "Failed to send OTP. Please check your phone number.";
      console.error("Firebase SMS Error:", err);
      setError(errorMessage); // Show the error to the user
    }
  };

  // Verify OTP and move to the next step
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(""); // Reset previous errors
    try {
      const confirmationResult = window.confirmationResult;
      const result = await confirmationResult.confirm(formData.otp);

      // Firebase user is now authenticated
      const user = result.user;
      console.log("OTP Verified via Firebase:", user);

      // Update formData with Firebase user info
      setFormData(prev => ({
        ...prev,
        uid: user.uid,
        phone: user.phoneNumber
      }));

      setStep(3); // Move to the registration step
    } catch (err) {
      const errorMessage = err.message || "Invalid OTP. Please try again.";
      console.error("Firebase OTP Verification Error:", err);
      setError(errorMessage); // Show the error to the user
    }
  };

  // Submit registration details
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Reset previous errors
    try {
      const registrationData = {
        ...formData,
        role: "driver" // This is a driver registration form
      };

      const response = await axios.post(`${BaseURL}/auth/register`, registrationData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Registration Successful:", response.data);
      alert("Registration completed successfully!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        `Server Error: ${err.response?.status || "Unknown Error"}`;
      console.error("Error during registration:", err.response || err.message);
      setError(errorMessage); // Show the error to the user
    }
  };

  return (
    <div className="multi-step-form">
      {step === 1 && (
        <form onSubmit={handleGenerateOtp}>
          <h2>Step 1: Enter Phone Number</h2>
          <div>
            <label>Phone:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Generate OTP</button>
          {error && <p className="error">{error}</p>}
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <h2>Step 2: Verify OTP</h2>
          <p>
            OTP has been sent to {formData.phone}. Please check your messages.
          </p>
          <div>
            <label>OTP:</label>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Verify OTP</button>
          {error && <p className="error">{error}</p>}
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleRegister}>
          <h2>Step 3: Driver Registration</h2>
          <div>
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>City:</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Driver Type:</label>
            <input
              type="text"
              name="driverType"
              value={formData.driverType}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Service Type:</label>
            <input
              type="text"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Car Category:</label>
            <input
              type="text"
              name="carCategory"
              value={formData.carCategory}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Referral Code (Optional):</label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
            />
          </div>
          <button type="submit">Register</button>
          {error && <p className="error">{error}</p>}
        </form>
      )}
    </div>
  );
};

export default MultiStepForm;
