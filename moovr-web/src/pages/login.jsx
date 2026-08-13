import React, { useState, useEffect } from "react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { auth, googleProvider, sendOtp } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import toast from "react-hot-toast";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const handlePhoneNumberChange = (value) => {
    setPhoneNumber(value);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Google User:", user);
      toast.success("Signed in with Google successfully!");
    } catch (error) {
      if (error.code === 'auth/cancelled-by-user' || error.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error("Google Sign-In Error:", error);
      toast.error(`Failed to sign in with Google: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    try {
      console.log("Attempting to send OTP via sendOtp helper (Login)...");
      const confirmation = await sendOtp(phoneNumber);
      setConfirmationResult(confirmation);
      toast.success("OTP sent to your phone!");
    } catch (error) {
      console.error("Phone Auth Error:", error);
      if (error.code === 'auth/invalid-app-credential') {
        toast.error("Invalid app credential. Please check if your domain is authorized in Firebase Console and reCAPTCHA is configured correctly.");
      } else {
        toast.error("Failed to send OTP. Make sure the phone number is in international format (e.g. +1234567890)");
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      console.log("Phone User:", user);
      toast.success("Phone verified successfully!");
    } catch (error) {
      console.error("OTP Verification Error:", error);
      toast.error("Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-5xl h-[550px] grid md:grid-cols-2">
        <div className="p-8 w-96 mx-auto">
          {!confirmationResult ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Enter your mobile number</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <PhoneInput
                  international
                  defaultCountry="NG"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  className="w-full border-2 border-gray-200 rounded-full p-2 focus:outline-none hover:bg-none"
                  placeholder="Enter phone number"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600"
                >
                  Continue
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Enter the OTP sent to {phoneNumber}</h2>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-full p-2 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600"
                >
                  Verify OTP
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmationResult(null)}
                  className="w-full text-sm text-gray-500 hover:text-purple-500"
                >
                  Change phone number
                </button>
              </form>
            </>
          )}
          <div className="text-center mt-4">
            <p>
              Don't have an account?{" "}
              <a href="#" className="text-purple-500">
                Sign up
              </a>
            </p>
          </div>
          <div className="flex items-center my-4">
            <hr className="flex-1" />
            <span className="px-4 text-gray-400">or</span>
            <hr className="flex-1" />
          </div>
          <div className="space-y-3">
            <button 
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2 border border-gray-300 rounded-full flex items-center justify-center space-x-2 hover:bg-gray-100"
            >
              <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>
            <button className="w-full py-2 border border-gray-300 rounded-full flex items-center justify-center space-x-2 hover:bg-gray-100">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/633px-Apple_logo_black.svg.png"
                alt="Apple"
                className="w-5 h-5"
              />
              <span>Continue with Apple</span>
            </button>
            <button className="w-full py-2 border border-gray-300 rounded-full flex items-center justify-center space-x-2 hover:bg-gray-100">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                alt="Facebook"
                className="w-5 h-5"
              />
              <span>Continue with Facebook</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            By proceeding, you consent to get calls, WhatsApp or SMS messages,
            including by automated dialer, from MovoR and its affiliates to the
            number provided. Text "STOP" to 67890 to opt out.
          </p>
        </div>
        <div className="hidden md:block">
          <img
            src="/Login-BG.jpg"
            alt="Login Graphic"
            className="object-cover h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
