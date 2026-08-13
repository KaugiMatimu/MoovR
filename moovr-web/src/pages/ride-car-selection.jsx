import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header"; // Import your Header component
import RideOptions from "../components/ride-options";
import PaymentSelector from "../components/payment-selector";
import { BaseURL } from "../utils/BaseURL";
import axios from "axios";
import toast from "react-hot-toast";

const RideSelectionScreen = () => {
  const [selectedVehicle, setSelectedVehicle] = useState("moovr x");
  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBookRide = async () => {
    if (!selectedVehicle) {
      toast.error("Please select a vehicle type");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Retrieve pickup and dropoff from localStorage or state if available
      // For this example, I'll use placeholders if not found
      const pickupData = JSON.parse(localStorage.getItem("pickupLocation")) || { address: "Current Location", coordinates: [0, 0] };
      const dropoffData = JSON.parse(localStorage.getItem("dropoffLocation")) || { address: "Destination", coordinates: [0, 0] };

      const response = await axios.post(
        `${BaseURL}/ride/create`,
        {
          pickupLocation: pickupData.address,
          dropoffLocation: dropoffData.address,
          pickupCoordinates: pickupData.coordinates,
          dropoffCoordinates: dropoffData.coordinates,
          vehicleType: selectedVehicle,
          paymentMethod: selectedPayment,
          distance: 10, // Placeholder
          estimatedTime: 20, // Placeholder
          pickupType: "now"
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success("Ride request sent!");
      navigate("/ride/meet", { state: { ride: response.data.ride } });
    } catch (error) {
      console.error("Error booking ride:", error);
      toast.error(error.response?.data?.message || "Failed to book ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="relative h-full">
        {/* Map Background */}
        <div className="absolute inset-0 ">
          <img
            title="Map"
            src="/images/full-map-img.png"
            className="w-full h-full"
          />
        </div>

        {/* Floating Cards */}
        <div className="absolute top-[10%] left-[10%]  flex flex-col items-center space-y-4">
          {/* Ride Options */}
          <RideOptions 
            onSelectOption={setSelectedVehicle} 
            selectedOption={selectedVehicle} 
          />

          {/* Payment Selector */}
          <div className="flex flex-col gap-3">
            <PaymentSelector 
              onPaymentMethodChange={setSelectedPayment} 
              selectedPayment={selectedPayment} 
            />
            
            {/* Action Button */}
            <button 
              onClick={handleBookRide}
              disabled={loading}
              className="bg-purple-500 w-full text-white py-2 px-4 rounded-full text-sm font-semibold hover:bg-purple-600 disabled:bg-purple-300"
            >
              {loading ? "Booking..." : "Select MoovR"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideSelectionScreen;
