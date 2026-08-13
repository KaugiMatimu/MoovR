import React, { useEffect, useState } from "react";
import Header from "../../../components/user-panel/header";
import Carousel from "../../../components/user-panel/carousel";
import RideForm from "../../../components/user-panel/ride-form";
import { BaseURL } from "../../../utils/BaseURL";
import { DotLoader } from "react-spinners";
import toast from "react-hot-toast";

const Ride = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if browser supports geolocation
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      setIsLoading(false);
      return;
    }

    // Watch user location continuously
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updatePassengerLocation(latitude, longitude);
      },
      (error) => {
        console.error("Error fetching location:", error);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("❌ Location access was denied. Please enable it in browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("⚠️ Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("⏰ Location request timed out.");
            break;
          default:
            toast.error("⚠️ An unknown error occurred while fetching location.");
            break;
        }

        setIsLoading(false);
      },
      { enableHighAccuracy: true }
    );

    // Cleanup the location watcher when component unmounts
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Send the passenger's coordinates to backend
  const updatePassengerLocation = async (latitude, longitude) => {
    console.log("Updating passenger location:", { latitude, longitude });

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        // For guest users, we don't update location in the database but still allow them to see the map
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${BaseURL}/auth/update-passenger-location`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await response.json();
      console.log("Location update response:", response.status, data);

      if (!response.ok) {
        console.warn("Failed to update location:", data.message);
      }
    } catch (err) {
      console.error("Error updating location:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <DotLoader color="#A75AF2" />
        </div>
      ) : (
        <div className="grid md:grid-cols-1 min-h-[500px] items-center p-4">
          <RideForm />
        </div>
      )}

      <Carousel />
    </div>
  );
};

export default Ride;
