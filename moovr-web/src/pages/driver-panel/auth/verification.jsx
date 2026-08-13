import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { BaseURL } from "../../../utils/BaseURL";
import Cookies from "js-cookie";

const DriverVerification = () => {
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
      toast.error("Verification session expired. Please try registering again.");
      navigate("/d/signup");
      return;
    }

    try {
      const result = await window.confirmationResult.confirm(verificationCode);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await axios.post(
        `${BaseURL}/auth/firebase-verify`,
        { idToken, role: "driver" },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        toast.success("OTP verified successfully!");

        const { token, user: backendUser } = response.data;

        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("userData", JSON.stringify(backendUser));

          // ✅ Set cookies with consistent path and expiration
          Cookies.set("token", token, { expires: 7, path: "/" });
          Cookies.set("role", backendUser.role, { expires: 7, path: "/" });

          // Check if driver setup is complete
          const isProfileComplete = backendUser.profilePicture && 
                                  backendUser.documents?.proofOfResidency &&
                                  backendUser.documents?.drivingLicense && 
                                  backendUser.documents?.vehicleRegistrationBook &&
                                  backendUser.documents?.vehicleInsurance &&
                                  backendUser.termsAccepted;

          // ✅ Redirect based on completeness
          if (isProfileComplete) {
            window.location.href = "/d/dashboard";
          } else {
            window.location.href = "/d/";
          }
        } else {
          localStorage.setItem("userData", JSON.stringify(backendUser));
          navigate("/d/name");
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Toaster />
      <div className="w-full max-w-[1180px] min-h-[500px] flex items-center bg-white rounded-2xl shadow-md p-8 relative overflow-hidden">
        {/* Bottom right curve */}
        <div className=" absolute bottom-0 left-0 h-full">
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
    </div>
  );
};

export default DriverVerification;
