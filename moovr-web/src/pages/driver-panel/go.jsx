import React, { useEffect, useState } from "react";
import Header from "../../components/driver-panel/header";
import "../../App.css";
import { Link } from "react-router-dom";
import { BaseURL } from "../../utils/BaseURL";
import toast from "react-hot-toast";

const Go = () => {
  const [locationError, setLocationError] = useState(null);
  const [watchId, setWatchId] = useState(null);

  // Function to start watching position
  const startWatchingLocation = () => {
    setLocationError(null); // Clear previous errors

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    let currentWatchId = null;
    currentWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationError(null);
        updateDriverLocation(latitude, longitude);
      },
      async (error) => {
        console.error("Go.jsx geolocation error:", error);
        if (error.code === 3) {
          console.warn("Geolocation watch timeout expired, attempting fallback getCurrentPosition.", error);
          setLocationError("Location request timed out. Retrying...");
          if (currentWatchId !== null) {
            navigator.geolocation.clearWatch(currentWatchId);
            setWatchId(null);
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setLocationError(null);
              updateDriverLocation(latitude, longitude);
              startWatchingLocation();
            },
            (fallbackError) => {
              console.error("Fallback geolocation failed:", fallbackError);
              handleLocationError(fallbackError);
            },
            {
              enableHighAccuracy: false,
              timeout: 120000,
              maximumAge: 15000,
            }
          );
          return;
        }

        handleLocationError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 120000,
        maximumAge: 15000,
      }
    );

    setWatchId(currentWatchId);
  };

  // Handle location errors
  const handleLocationError = (error) => {
    console.error("Error fetching location:", error);
    if (error.code === 1) {
      setLocationError(
        <span>
          Location access is blocked. Please enable it in your browser settings.
          <br />
          <span className="text-sm">
            (Check browser permissions or site settings)
          </span>
        </span>
      );
    } else {
      setLocationError("Location error: " + error.message);
    }
  };

  // Initialize location watching
  useEffect(() => {
    startWatchingLocation();
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Update driver location in backend
  const updateDriverLocation = async (latitude, longitude) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login again");
        return;
      }

      const response = await fetch(`${BaseURL}/auth/update-location`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error("Failed to update location");
        console.error("API Error:", errorData);
      }
    } catch (err) {
      toast.error("Network error");
      console.error("Update location error:", err);
    }
  };

  return (
    <div className="relative h-screen flex flex-col">
      <div className="absolute top-0 right-0 left-0 z-10">
        <Header />
      </div>
      <main className="flex-grow h-full bg-gray-100">
        <div className="h-full relative">
          <img
            src="/map.png"
            alt="Map"
            className="w-full h-full object-cover"
          />
          
          {/* Location error banner */}
          {locationError && (
            <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-white border border-red-300 shadow-lg rounded-lg p-4 max-w-md z-20">
              <div className="flex items-start">
                <div className="flex-shrink-0 text-red-500 mt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Location Required
                  </h3>
                  <div className="mt-1 text-sm text-red-700">
                    {locationError}
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={startWatchingLocation}
                      className="text-sm bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-3 rounded"
                    >
                      Retry Permission
                    </button>
                    <a
                      href="https://support.google.com/chrome/answer/142065?co=GENIE.Platform%3DDesktop&hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      How to enable?
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Go Button */}
          <div className="absolute -translate-x-1/2 left-1/2 bottom-5 flex justify-center items-center">
            <div className="go-button-bg-gradient p-5 rounded-full">
              <Link to={"/d/accept"}>
                <button className="go-button-gradient text-white px-6 py-2 h-[100px] w-[100px] rounded-full text-[32px] font-[600]">
                  Go
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Go;