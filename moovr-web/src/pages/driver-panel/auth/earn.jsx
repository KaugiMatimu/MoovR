import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Earn = () => {
  const [city, setCity] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    localStorage.setItem(
      "userData",
      JSON.stringify({ ...userData, city, referralCode })
    );
    navigate("/d/account-types");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Referral Code (Optional)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <button type="submit" className="w-full py-3 bg-purple-500 text-white">
          Next
        </button>
      </form>
    </div>
  );
};

export default Earn;
