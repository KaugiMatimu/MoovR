import React , { useState} from "react";
import { Link, useLocation } from "react-router-dom";

export default function ChoosePanel() {
  const location = useLocation();
  const state = location.state || {};
  const from = state.from || "signup"; // fallback if undefined

  // Remove console.log to avoid extension conflicts
  // console.log("From:", from);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[1180px] bg-white rounded-2xl shadow-md p-8 relative overflow-hidden">

        {/* Bottom left curve */}
        <div className="absolute bottom-0 left-0 h-full">
          <img
            src="/driver/driver-bg-img-1.svg"
            alt="Driver Background"
            className="h-full w-full object-contain"
          />
        </div>

        {/* Top right curve */}
        <div className="absolute top-0 right-0">
          <img
            src="/driver/auth/welcome.svg"
            alt="Welcome"
            className="transform rotate-90"
          />
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-[300px] relative">
          <h1 className="text-2xl font-semibold mb-2">Choose Account Role</h1>
          <p className="text-gray-600 mb-8">
            Please select your role to get started. Let us know if you're here
            to book rides or provide ride services.
          </p>

          <div className="space-y-4">
            {/* Driver Option */}
            <Link
              to={from === "login" ? "/login" : "/d/signup"}
              state={{ role: "driver" }}
              className="block w-full p-4 bg-gray-50 h-[120px] border border-gray-300 rounded-lg text-left hover:bg-gray-100 transition-colors"
            >
              <h3 className="font-medium mb-1">Driver</h3>
              <p className="text-sm text-gray-500">
                Create an account to receive ride requests and earn.
              </p>
            </Link>

            {/* Passenger Option */}
            <Link
              to={from === "login" ? "/login" : "/signup"}
              state={{ role: "user" }}
              className="block w-full p-4 bg-gray-50 h-[120px] border border-gray-300 rounded-lg text-left hover:bg-gray-100 transition-colors"
            >
              <h3 className="font-medium mb-1">Passager</h3>
              <p className="text-sm text-gray-500">
                Create an account to book rides conveniently.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
