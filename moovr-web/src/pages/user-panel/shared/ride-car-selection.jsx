import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/user-panel/header"; // Import your Header component
import RideOptions from "../../../components/user-panel/ride-options";
import PaymentSelector from "../../../components/user-panel/payment-selector";
import DriverInfoCard from "../../../components/user-panel/driver-info-card";
import axios from "axios";
import { BaseURL } from "../../../utils/BaseURL";
import toast, { Toaster } from "react-hot-toast";
import { useSocket } from "../../../context/LocationProvider";

const RideSelectionScreen = () => {
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [vehicleType, setVehicleType] = useState("moovr x");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [rideId, setRideId] = useState(null);
  const [acceptedRide, setAcceptedRide] = useState(null);
  const [statusText, setStatusText] = useState("Searching for nearby drivers...");
  const [showAcceptedBadge, setShowAcceptedBadge] = useState(false);
  const rideData = location.state?.rideData;
  const shouldShareLocation = Boolean(rideId && acceptedRide?.status === "accepted");
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [searchNote, setSearchNote] = useState("Searching for nearby drivers...");
  const [searchRadius, setSearchRadius] = useState(null);
  
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }
      const existingScript = document.getElementById("googleMapsScript");
      if (existingScript) {
        existingScript.onload = resolve;
        return;
      }
      const script = document.createElement("script");
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      script.id = "googleMapsScript";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const updateDriverMarkers = useCallback((drivers) => {
    const google = window.google;
    if (!google || !google.maps || !mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    drivers.forEach((driver) => {
      if (driver.location && driver.location.coordinates) {
        const marker = new google.maps.Marker({
          position: {
            lat: driver.location.coordinates[1],
            lng: driver.location.coordinates[0],
          },
          map: mapInstance.current,
          icon: {
            url: "/images/car-icon.png",
            scaledSize: new google.maps.Size(30, 30),
          },
          title: `${driver.firstName} ${driver.lastName}`,
        });
        markersRef.current.push(marker);
      }
    });
  }, []);

  const fetchNearbyDrivers = useCallback(async (lng, lat) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BaseURL}/rides/nearby-drivers?lng=${lng}&lat=${lat}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const drivers = response.data?.drivers || [];
      setNearbyDrivers(drivers);
      setSearchRadius(response.data?.radius);
      setSearchNote(response.data?.note || "Searching for nearby drivers...");
      updateDriverMarkers(drivers);
    } catch (error) {
      console.error("Error fetching nearby drivers:", error);
      setSearchNote("Unable to fetch nearby drivers right now.");
    }
  }, [updateDriverMarkers]);

  const initializeMap = useCallback(() => {
    const google = window.google;
    if (!google || !google.maps || !mapRef.current) return;

    const center = rideData?.pickupCoordinates 
      ? { lat: rideData.pickupCoordinates[1], lng: rideData.pickupCoordinates[0] }
      : { lat: 6.5244, lng: 3.3792 }; // Lagos default

    mapInstance.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      disableDefaultUI: true,
    });

    // Add pickup marker
    if (rideData?.pickupCoordinates) {
      new google.maps.Marker({
        position: center,
        map: mapInstance.current,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        },
        title: "Pickup Location"
      });
    }

    fetchNearbyDrivers(center.lng, center.lat);
  }, [fetchNearbyDrivers, rideData]);

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => initializeMap())
      .catch((error) => console.error("Failed to load Google Maps script.", error));
  }, [initializeMap]);

  useEffect(() => {
    if (socket) {
      socket.on("rideAccepted", (ride) => {
        console.log("Ride accepted via socket:", ride);
        toast.success("Ride accepted!");
        setAcceptedRide(ride);
        setShowAcceptedBadge(true);
        setStatusText("Driver accepted your ride. Showing driver progress...");
        setLoading(false);
        // Auto-navigate passenger to meet screen so state is persisted by query param
        try {
          const query = ride && (ride._id || ride.id) ? `?rideId=${ride._id || ride.id}` : "";
          navigate(`/ride/meet${query}`, { state: { ride } });
        } catch (e) {
          console.warn("Failed to auto-navigate to meet screen:", e);
        }
      });

      socket.on("rideStatusUpdated", (updatedRide) => {
        if (!rideId || updatedRide._id !== rideId) return;

        setAcceptedRide(updatedRide);
        setLoading(false);

        if (updatedRide.status === "completed") {
          setShowAcceptedBadge(false);
          setStatusText("Ride completed. Redirecting to payment and rating...");
          navigate(`/ride/completed?rideId=${updatedRide._id}`, {
            state: { rideId: updatedRide._id, ride: updatedRide },
          });
          return;
        }

        setShowAcceptedBadge(true);
        setStatusText(
          updatedRide.status === "running"
            ? "Driver is almost here. Tracking your ride..."
            : updatedRide.status === "arrived"
              ? "Your driver has arrived!"
              : "Ride status updated."
        );
      });

      // Listen for driver location updates to move markers in real-time
      socket.on("driverLocationUpdate", () => {
        // Optional: Implement real-time marker movement if drivers emit their location via socket
      });
    }

    return () => {
      if (socket) {
        socket.off("rideAccepted");
        socket.off("rideStatusUpdated");
        socket.off("driverLocationUpdate");
      }
    };
  }, [socket, rideId, navigate]);

  useEffect(() => {
    if (!shouldShareLocation || !rideId || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const token = localStorage.getItem("token");
          if (!token) return;

          await fetch(`${BaseURL}/auth/update-passenger-location`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ latitude, longitude, rideId }),
          });
        } catch (error) {
          console.error("Error sharing live passenger location after ride acceptance:", error);
        }
      },
      (error) => {
        console.error("Passenger location watch error after ride acceptance:", error);
      },
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [shouldShareLocation, rideId]);

  useEffect(() => {
    let pollInterval;

    const pollRideStatus = async () => {
      if (!rideId) return;
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BaseURL}/rides/status/${rideId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ride = response.data.ride;
        if (ride?.status === "accepted") {
          setAcceptedRide(ride);
          setLoading(false);
          setShowAcceptedBadge(true);
          setStatusText("Ride accepted! Showing driver progress...");
        }

        if (ride?.status === "completed") {
          setAcceptedRide(ride);
          setLoading(false);
          setShowAcceptedBadge(false);
          setStatusText("Ride completed. Redirecting to payment and rating...");
          navigate(`/ride/completed?rideId=${ride._id}`, {
            state: { rideId: ride._id, ride },
          });
        }
      } catch (error) {
        console.error("Error polling ride status:", error);
      }
    };

    if (rideId) {
      pollInterval = setInterval(pollRideStatus, 5000);
      pollRideStatus();
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [rideId, navigate]);

  const handleCreateRide = async () => {
    if (!rideData) return;
    if (rideId || isCreating) {
      toast.info("A ride request is already in progress.");
      return;
    }

    setLoading(true);
    setIsCreating(true);
    try {
      const response = await axios.post(`${BaseURL}/rides/create`, { ...rideData, vehicleType, paymentMethod }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        setRideId(response.data.ride._id);
        setStatusText("Searching for nearby drivers...");
        toast.success("Ride created! Waiting for driver...");
      } else {
        toast.error("Failed to create ride. Please try again.");
        setLoading(false);
        setIsCreating(false);
      }
    } catch (error) {
      toast.error("Error creating ride. Please try again.");
      console.error("Error creating ride:", error);
      setLoading(false);
      setIsCreating(false);
    }
  };

  const handleCancelRide = async () => {
    if (!rideId) return;

    try {
      const response = await axios.post(`${BaseURL}/rides/cancel/${rideId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        toast.success("Ride cancelled successfully.");
        setLoading(false);
        setRideId(null);
        setIsCreating(false);
      }
    } catch (error) {
      toast.error("Error cancelling ride.");
      console.error("Error cancelling ride:", error);
    }
  };

  return (
    <div className="h-screen w-screen">
      <Toaster />
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="relative h-full">
        {/* Real Map */}
        <div ref={mapRef} className="absolute inset-0 w-full h-full" />

        {/* Floating Cards */}
        <div className="absolute top-[10%] left-[10%]  flex flex-col items-center space-y-4">
          {acceptedRide ? (
            <DriverInfoCard ride={acceptedRide} />
          ) : (
            <>
              {/* Ride Options */}
              <RideOptions onSelect={(type) => setVehicleType(type)} />

              {/* Available drivers panel */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-4 w-[320px] mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Drivers Nearby</h3>
                    <p className="text-xs text-gray-500">{nearbyDrivers.length} available</p>
                    {searchRadius && (
                      <p className="text-xs text-slate-500">
                        Showing drivers within {searchRadius / 1000}km
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-purple-600">Live</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{searchNote}</p>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {nearbyDrivers.length === 0 ? (
                    <p className="text-sm text-gray-500">Searching for nearby drivers...</p>
                  ) : (
                    nearbyDrivers.map((driver) => (
                      <div key={driver._id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        {driver.profilePicture ? (
                          <img
                            src={driver.profilePicture}
                            alt={driver.firstName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-lg font-semibold">
                            {driver.firstName?.[0] || "D"}
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-sm text-slate-900">{driver.firstName} {driver.lastName}</p>
                          <p className="text-xs text-slate-500">{driver.carCategory || driver.serviceType || "MoovR"}</p>
                          <div className="flex items-center gap-2 text-xs text-yellow-500 mt-1">
                            <span>★ {driver.ratingAverage?.toFixed(1) || "0.0"}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500">{driver.availability ? "Available" : "Offline"}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Payment Selector */}
              <PaymentSelector 
                onClick={handleCreateRide} 
                onPaymentMethodChange={(method) => setPaymentMethod(method)} 
                selectedPayment={paymentMethod}
                disabled={loading || isCreating || !!rideId}
              />
            </>
          )}
        </div>

        {/* Loading Spinner / Searching for Driver */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-[100]">
            <div className="loader mb-6"></div>
            <div className="flex flex-col items-center gap-4">
              <div className="text-white text-xl font-semibold text-center">{statusText}</div>
              {showAcceptedBadge && (
                <div className="bg-emerald-500 text-white rounded-full px-5 py-2 text-sm font-semibold shadow-lg">
                  Driver accepted your ride
                </div>
              )}
            </div>
            <button 
              onClick={handleCancelRide}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg"
            >
              Cancel Ride
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideSelectionScreen;
