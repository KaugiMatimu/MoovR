import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BaseURL } from "../../../utils/BaseURL";
import Cookies from "js-cookie";


export default function VehicleTypes() {
  const navigate = useNavigate();
  const vehicles = [
    {
      title: "MoovR X",
      description: "You want to drive four door vehicle on MoovR platform.",
    },
    {
      title: "MoovR Mini",
      description:
        "You want to drive four door mini vehicle on MoovR platform.",
    },
    {
      title: "MoovR Electric",
      description: "You want to drive electric vehicle on MoovR platform.",
    },
  ];

  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleSubmit = async () => {
    if (!selectedVehicle) {
      alert("Please select a vehicle type!");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    userData.carCategory = selectedVehicle;
    userData.role = "driver";

    // Lowercase all string values in userData
    Object.keys(userData).forEach((key) => {
      if (typeof userData[key] === "string") {
        userData[key] = userData[key].toLowerCase();
      }
    });

    console.log("Sending Data:", userData);

    try {
      const response = await fetch(`${BaseURL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      console.log(response, 'the response');
      if (response.ok) {
        const data = await response.json(); // Parse response to get the token and user details
        const { token, user } = data;
        const role ="driver";

        // Save token and user to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Clear userData from localStorage
        localStorage.removeItem("userData");
        // ✅ Set cookies with consistent path and expiration
        Cookies.set("token", token, { expires: 7, path: "/" });
        Cookies.set("role", role, { expires: 7, path: "/" });

        alert("Registration successful!");
        navigate("/d/welcome");
      } else {
        alert("Error occurred during registration.");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Something went wrong, please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[1180px] bg-white rounded-2xl shadow-md p-8 relative overflow-hidden">
        {/* Bottom right curve */}
        <div className="absolute bottom-0 left-0 h-full">
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
          <h1 className="text-2xl font-semibold mb-8">
            Choose how would you like to earn with MoovR
          </h1>

          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.title}
                onClick={() => setSelectedVehicle(vehicle.title)}
                className={`w-full p-4 mt-4 h-[120px] border rounded-lg text-left transition-colors ${
                  selectedVehicle === vehicle.title
                    ? "bg-purple-100 border-purple-500"
                    : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                }`}
              >
                <h3 className="font-medium mb-2">{vehicle.title}</h3>
                <p className="text-sm text-gray-500">{vehicle.description}</p>
              </button>
            ))}
            <button
              onClick={handleSubmit}
              className="w-full py-2 mt-6 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
