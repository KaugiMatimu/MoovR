import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BaseURL } from "../../../utils/BaseURL";
import Cookies from "js-cookie";

const Verification = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(57);
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();

  // Handle input changes for each digit
  const handleChange = (e, index) => {
    const newCode = [...code];
    newCode[index] = e.target.value.slice(0, 1); // Ensure only one character
    setCode(newCode);

    // Focus the next input automatically
    if (e.target.value && index < 5) {
      document.getElementById(`digit-${index + 1}`).focus();
    }
  };

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    // Get userData from localStorage and extract the phone number
    const userData = JSON.parse(localStorage.getItem("userData"));
    const number = userData?.phone || "";
    setPhoneNumber(number);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (!phoneNumber) {
      toast.error("Phone number not found in localStorage.");
      return;
    }

    if (!window.confirmationResult) {
      toast.error("Verification session expired. Please try logging in again.");
      navigate("/login");
      return;
    }

    try {
      const result = await window.confirmationResult.confirm(verificationCode);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      const response = await axios.post(
        `${BaseURL}/auth/firebase-verify`,
        { idToken, role: "user" },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        toast.success("OTP verified successfully!");

        const { token, user: backendUser, isRegistered } = response.data;
        const role = backendUser.role || "user";

        if (token) {
          // ✅ Set cookies with consistent path and expiration
          Cookies.set("token", token, { expires: 7, path: "/" });
          Cookies.set("role", role, { expires: 7, path: "/" });
          localStorage.setItem("token", token);
          localStorage.setItem("role", role);
          localStorage.setItem("userData", JSON.stringify(backendUser));

          toast.success("OTP verified successfully!");
          
          // Force immediate redirection
          window.location.href = role === "driver" ? "/d/dashboard" : "/ride";
        } else {
          // If no token, user might need to complete registration (name, etc)
          localStorage.setItem("userData", JSON.stringify(backendUser));
          navigate("/name");
        }

      } else {
        toast.error("Unexpected response. Please try again.");
      }
    } catch (error) {
      console.error("Verification Error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Invalid OTP. Please try again.";
      toast.error(errorMessage);
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
        <h2 className="text-lg font-semibold mb-4">
          Enter the 6 digit code sent to you at {phoneNumber}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-4">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                id={`digit-${index}`}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                className="w-16 h-16 text-center text-2xl border rounded-lg focus:outline-none focus:border-purple-500"
                maxLength="1"
              />
            ))}
          </div>
          <div className="text-sm text-gray-500">
            Resend code{" "}
            {resendTimer > 0 ? (
              <span className="text-gray-700">{`0:${
                resendTimer < 10 ? `0${resendTimer}` : resendTimer
              }`}</span>
            ) : (
              <button
                type="button"
                className="text-purple-500"
                onClick={() => setResendTimer(57)}
              >
                Resend
              </button>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-3 bg-purple-500 text-white rounded-full text-lg hover:bg-purple-600"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default Verification;
