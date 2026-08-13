import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { signInWithPhoneNumber, signInWithRedirect } from "firebase/auth";
import { auth, googleProvider, firebaseConfig } from "../firebase";
import { initRecaptchaVerifier } from "../utils/recaptcha";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import Cookies from "js-cookie";
import { BaseURL } from "../utils/BaseURL";

const Register = () => {
  const [countryCode, setCountryCode] = useState("+92");
  const [userNumber, setUserNumber] = useState("");
  const [fullPhone, setFullPhone] = useState("+92");
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleCountryChange = (value) => {
    const match = value.match(/^\+\d+/);
    const code = match ? match[0] : "+92";
    setCountryCode(code);
    setFullPhone(code + userNumber);
  };

  const handleUserNumberChange = (e) => {
    const number = e.target.value.replace(/\D/g, "");
    setUserNumber(number);
    setFullPhone(countryCode + number);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (userNumber.length < 6) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (error) {
          console.warn("Failed to clear existing reCAPTCHA verifier:", error);
        }
        window.recaptchaVerifier = null;
      }

      const appVerifier = initRecaptchaVerifier("recaptcha-container-register", auth);
      if (!appVerifier) {
        throw new Error("Unable to initialize reCAPTCHA. Please refresh and try again.");
      }

      const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      window.confirmationResult = confirmationResult;

      toast.success("OTP sent successfully!");

      const existingData = JSON.parse(localStorage.getItem("userData") || "{}");
      localStorage.setItem("userData", JSON.stringify({ ...existingData, phone: fullPhone }));

      navigate("/verification");
    } catch (error) {
      console.error("Firebase SMS Error:", error);

      let errorMessage = "Failed to send OTP. Please check your phone number.";

      if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Phone authentication is not enabled for this region. Please contact support.";
      } else if (error.code === "auth/invalid-phone-number") {
        errorMessage = "Invalid phone number format. Please check and try again.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please wait a few minutes and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
        setTimeout(() => {
          initRecaptchaVerifier("recaptcha-container-register", auth);
        }, 1000);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Google Login Error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Google Sign-In failed.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-5xl h-[550px] grid md:grid-cols-2">
        <div className="hidden md:block">
          <img
            src="/Singup-BG.jpg"
            alt="Login"
            className="object-cover h-full w-full"
          />
        </div>
        <div className="p-8 w-96 mx-auto">
          <div id="recaptcha-container-register"></div>
          <h2 className="text-2xl font-bold mb-4">Enter your mobile number</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center bg-gray-50 rounded-full px-3 py-2 space-x-2">
              <div className="relative inline-flex">
                <PhoneInput
                  defaultCountry="pk"
                  value={countryCode}
                  onChange={handleCountryChange}
                  inputClassName="hidden"
                  countrySelectorStyleProps={{
                    buttonClassName: `
                      !p-0 !bg-transparent !border-none !shadow-none
                      !h-10 !w-auto !px-2
                      flex items-center justify-center gap-1
                      focus:!ring-0
                      group
                    `,
                    flagClassName: `
                      !w-6 !h-6 rounded-full object-cover
                      border border-gray-100 shadow-sm
                    `,
                    dropdownArrowClassName: `
                      !ml-0 !text-gray-500 !w-4 
                      transition-transform duration-200
                      group-hover:!text-gray-700
                      group-data-[active=true]:rotate-180
                    `,
                    dropdownStyleProps: {
                      className: `
                        !mt-2 !left-0 !min-w-[220px]
                        !rounded-xl !shadow-lg !border !border-gray-200
                        !py-2
                      `,
                    },
                  }}
                />
              </div>
              <div className="text-base text-gray-700 font-medium h-12 flex items-center px-2">
                {countryCode}
              </div>
              <input
                type="tel"
                value={userNumber}
                onChange={handleUserNumberChange}
                className="flex-1 bg-transparent focus:outline-none h-12 text-base placeholder:text-gray-400"
                placeholder="Phone number"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Continue
            </button>
          </form>

          <div className="text-center mt-4">
            <p>
              Don't have an account?{" "}
              <a href="/signup" className="text-purple-600 hover:underline font-medium">
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
              onClick={handleGoogleLogin}
              className="w-full py-2 border border-gray-300 rounded-full flex items-center justify-center space-x-2 hover:bg-gray-100"
            >
              <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            By proceeding, you consent to get calls, WhatsApp or SMS messages,
            including by automated dialer, from Moovr and its affiliates to the
            number provided.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
