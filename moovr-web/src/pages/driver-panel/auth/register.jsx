import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { signInWithPopup, getRedirectResult, signInWithRedirect, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "../../../firebase";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { BaseURL } from "../../../utils/BaseURL";
import Cookies from "js-cookie";

const DriverRegister = () => {
  const location = useLocation();
  const { role } = location.state || { role: "driver" };
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
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
  }, []);

  const handleLoginSuccess = async (user, isNewUser = false, phoneData = null) => {
    try {
      const idToken = await user.getIdToken();
      console.log("Auth successful, verifying with backend...");

      const response = await axios.post(`${BaseURL}/auth/firebase-verify`, {
        idToken,
        role: "driver",
        name,
        ...(phoneData && { phone: phoneData }),
      });

      console.log("Backend response:", response.data);

      const { user: backendUser, isRegistered } = response.data;
      if (response.data.token) {
        const { token } = response.data;
        const roleToSet = backendUser.role || "driver";

        Cookies.set("token", token, { expires: 7, path: '/' });
        Cookies.set("role", roleToSet, { expires: 7, path: '/' });
        localStorage.setItem("token", token);
        localStorage.setItem("role", roleToSet);
        localStorage.setItem("userData", JSON.stringify(backendUser));

        toast.success(isNewUser ? "Registration successful!" : "Login successful!");
        
        const isProfileComplete = backendUser.profilePicture && 
                                backendUser.documents?.drivingLicense && 
                                backendUser.documents?.vehicleRegistrationBook;

        let target = roleToSet === "driver" 
          ? (isProfileComplete ? "/d/dashboard" : "/d/")
          : "/ride";

        console.log("Redirecting to:", target);
        setTimeout(() => {
          window.location.href = target;
        }, 500);
      } else if (backendUser && isRegistered === false) {
        localStorage.setItem("userData", JSON.stringify(backendUser));
        toast.success("Please complete your profile to continue.");
        navigate("/d/name");
      } else {
        toast.error(response.data.message || "Authentication failed.");
      }
    } catch (error) {
      console.error("Backend Verification Error:", error);
      toast.error(error.response?.data?.message || error.message || "Authentication failed.");
    }
  };

  const handleGoogleLoginResult = async (result) => {
    try {
      setLoading(true);
      await handleLoginSuccess(result.user);
    } catch (error) {
      console.error("Google Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!name || !email || !password || !phone) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      console.log("Attempting to register driver with email/password...");
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      await updateProfile(result.user, { displayName: name });
      
      await handleLoginSuccess(result.user, true, phone);
    } catch (error) {
      console.error("Registration Error:", error);
      let errorMessage = "Failed to register. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use.";
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      } else if (error.code !== 'auth/cancelled-by-user' && error.code !== 'auth/popup-closed-by-user') {
        toast.error(error.message || "Google Sign-In failed.");
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Toaster />
      <div className="bg-white md:shadow-lg rounded-lg overflow-hidden max-w-5xl h-[550px] grid md:grid-cols-2">
        <div className="p-8 w-96 mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Become a Driver</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Enter Your Name"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Enter Your Email"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">Phone Number</label>
              <PhoneInput
                defaultCountry="ng"
                value={phone}
                onChange={(phone) => setPhone(phone)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                inputClassName="!bg-transparent !border-none !w-full !h-10 !text-base focus:!ring-0"
                buttonClassName="!bg-transparent !border-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-purple-300"
            >
              {loading ? "Creating account..." : "Continue"}
            </button>
          </form>

          <div className="text-center mt-4">
            <p>
              Already have an account?{" "}
              <a href="/login" className="text-purple-500">
                Log In
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
              className="w-full py-2 border border-gray-300 rounded-full flex items-center justify-center space-x-2 hover:bg-gray-100 transition shadow-sm"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">Continue with Google</span>
            </button>
            <button className="w-full py-2 border border-gray-300 rounded-full flex items-center justify-center space-x-2 hover:bg-gray-100">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/633px-Apple_logo_black.svg.png"
                alt="Apple"
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">Continue with Apple</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            By proceeding, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
        <div className="hidden md:block">
          <img
            src="/driver/auth/signup-bg.png"
            alt="Signup Background"
            className="object-cover h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default DriverRegister;