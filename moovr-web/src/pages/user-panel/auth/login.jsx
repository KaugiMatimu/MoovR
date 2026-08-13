import React, { useState, useEffect } from "react";
import { PhoneInput } from "react-international-phone";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getRedirectResult, signInWithPopup, signInWithRedirect, signInWithPhoneNumber } from "firebase/auth";
import { auth, googleProvider } from "../../../firebase";
import { initRecaptchaVerifier } from "../../../utils/recaptcha";
import Cookies from "js-cookie";
import "react-international-phone/style.css";
import "react-toastify/dist/ReactToastify.css";
import { BaseURL } from "../../../utils/BaseURL";

const Login = () => {
  const location = useLocation();
  const role = location.state?.role || null; // fallback to null if not provided

  const [countryCode, setCountryCode] = useState("+92"); // Default country code
  const [userNumber, setUserNumber] = useState("");
  const [fullPhone, setFullPhone] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          handleGoogleLoginResult(result);
        }
      })
      .catch((error) => {
        console.error("Google Redirect Result Error:", error);
        if (error.code !== 'auth/redirect-cancelled-by-user') {
          toast.error("Google sign-in failed. Please try again.");
        }
      });

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const [loading, setLoading] = useState(false);

  const handleGoogleLoginResult = async (result) => {
    try {
      setLoading(true);
      const user = result.user;
      const idToken = await user.getIdToken();
      console.log("Google Auth successful, verifying with backend...");

      const response = await axios.post(`${BaseURL}/auth/google-login`, {
        idToken,
        role: role || "user"
      });

      console.log("Backend response:", response.data);

      if (response.data.token) {
        const { token, user: backendUser } = response.data;
        const roleToSet = backendUser.role || role || "user";

        Cookies.set("token", token, { expires: 7, path: '/' });
        Cookies.set("role", roleToSet, { expires: 7, path: '/' });
        localStorage.setItem("token", token);
        localStorage.setItem("role", roleToSet);
        localStorage.setItem("userData", JSON.stringify(backendUser));

        toast.success("Login successful!");
        const target = roleToSet === "driver" ? "/d/dashboard" : "/ride";
        console.log("Redirecting to:", target);
        setTimeout(() => {
          window.location.href = target;
        }, 500);
      } else {
        // User does not exist, redirect to signup with Google data
        toast.success("Google account linked! Please complete your registration.");
        const userData = {
          name: user.displayName,
          email: user.email,
          uid: user.uid,
          photoURL: user.photoURL,
          role: role || "user"
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        
        // Redirect to signup page
        navigate(role === "driver" ? "/d/signup" : "/signup", { 
          state: { googleData: userData } 
        });
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error(error.response?.data?.message || error.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (value) => {
    const match = value.match(/^\+\d+/);
    const code = match ? match[0] : "+234";
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
    console.log("your full phone number is :", fullPhone);

    if (userNumber.length < 6) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      // Ensure auth is ready and initialize RecaptchaVerifier
      const appVerifier = window.recaptchaVerifier || initRecaptchaVerifier('recaptcha-container-user-login', auth);
      if (!appVerifier) {
        throw new Error("Unable to initialize reCAPTCHA. Please refresh the page and try again.");
      }

      const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      
      // Store confirmationResult globally to access it in the verification page
      window.confirmationResult = confirmationResult;
      
      toast.success("OTP sent successfully!");
      
      // Merge with existing userData (like Google info) if it exists
      const existingData = JSON.parse(localStorage.getItem("userData") || "{}");
      localStorage.setItem("userData", JSON.stringify({ ...existingData, phone: fullPhone }));

      // ✅ Navigate with role passed in state
      navigate(role === "driver" ? "/d/verification" : "/verification", {
        state: { role },
      });
    } catch (error) {
      console.error("Firebase SMS Error:", error);
      const errorMessage = error.message || "Failed to send OTP. Please check your phone number.";
      toast.error(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      if (result && result.user) {
        await handleGoogleLoginResult(result);
      }
    } catch (error) {
      console.error("Google Login Popup Error:", error);
      if (error.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
          console.error("Google Login Redirect Error:", redirectError);
          toast.error("Google sign-in failed. Please try again.");
          setLoading(false);
        }
      } else if (error.code !== 'auth/cancelled-by-user') {
        toast.error(error.message || "Google Sign-In failed.");
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-5xl h-[550px] grid md:grid-cols-2">
        <div className="p-8 w-96 mx-auto">
          <div id="recaptcha-container-user-login"></div>
          <h2 className="text-2xl font-bold mb-4">Enter your mobile number</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center bg-gray-50 rounded-full px-3 py-2 space-x-2">
              <div className="relative inline-flex">
                <PhoneInput
                  defaultCountry="ng"
                  preferredCountries={["ng", "us", "gb"]}
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
              <Link
                to={role === "driver" ? "/d/signup" : "/signup"}
                className="text-purple-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-400 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 border border-gray-300 rounded-full flex items-center justify-center space-x-2 hover:bg-gray-50 transition shadow-sm"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">Continue with Google</span>
            </button>
            <button className="w-full py-2.5 border border-gray-300 rounded-full flex items-center justify-center space-x-2 hover:bg-gray-50 transition shadow-sm">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/633px-Apple_logo_black.svg.png"
                alt="Apple"
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">Continue with Apple</span>
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6 text-center">
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
