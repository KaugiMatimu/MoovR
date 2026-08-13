import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/driver-panel/header";
import { MdOutlinePersonOutline, MdEmergency } from "react-icons/md";
import { IoIosStar } from "react-icons/io";
import { FaPhone } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BaseURL } from "../../utils/BaseURL";
import { useSocket } from "../../context/LocationProvider";
import emergencyCallService from "../../services/emergencyCallService";

const Reached = () => {
  const location = useLocation();
  const { ride, activeTab } = location.state; // Destructure activeTab
  const { socket, joinRideRoom, updateDriverLocation } = useSocket();
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeSteps, setRouteSteps] = useState([]);
  const [showNavigationPanel, setShowNavigationPanel] = useState(false);
  const [isSharingActive, setIsSharingActive] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  const [creatingShare, setCreatingShare] = useState(false);
  const [mapError, setMapError] = useState("");
  const [isCallingEmergency, setIsCallingEmergency] = useState(false);
  const [showEmergencyOptions, setShowEmergencyOptions] = useState(false);
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const pickupMarkerRef = useRef(null);
  const passengerMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const watchIdRef = useRef(null);

  const getCoordinatePair = (value) => {
    if (!value) return null;

    if (Array.isArray(value)) {
      return { lat: value[1], lng: value[0] };
    }

    if (Array.isArray(value?.coordinates)) {
      return { lat: value.coordinates[1], lng: value.coordinates[0] };
    }

    if (value?.type === "Point" && Array.isArray(value?.coordinates)) {
      return { lat: value.coordinates[1], lng: value.coordinates[0] };
    }

    return null;
  };

  const updateMapMarkers = () => {
    const google = window.google;
    if (!google?.maps || !mapInstance.current) return;

    const pickupPosition = getCoordinatePair(ride?.pickupCoordinates) || { lat: 6.5244, lng: 3.3792 };
    const passengerPosition = passengerLocation ? { lat: passengerLocation[1], lng: passengerLocation[0] } : null;
    const currentDriverPosition = driverLocation ? { lat: driverLocation[1], lng: driverLocation[0] } : null;

    if (!pickupMarkerRef.current) {
      pickupMarkerRef.current = new google.maps.Marker({
        position: pickupPosition,
        map: mapInstance.current,
        title: "Pickup location",
        label: {
          text: "Pickup",
          className: "pickup-map-label",
          color: "#0f172a",
          fontSize: "12px",
          fontWeight: "700",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#2563eb",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });
    } else {
      pickupMarkerRef.current.setPosition(pickupPosition);
    }

    if (currentDriverPosition) {
      if (!driverMarkerRef.current) {
        driverMarkerRef.current = new google.maps.Marker({
          position: currentDriverPosition,
          map: mapInstance.current,
          title: "Your location",
          label: {
            text: "You",
            className: "pickup-map-label",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "700",
          },
          icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 7,
            fillColor: "#10b981",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
      } else {
        driverMarkerRef.current.setPosition(currentDriverPosition);
      }
    }

    if (passengerPosition) {
      if (!passengerMarkerRef.current) {
        passengerMarkerRef.current = new google.maps.Marker({
          position: passengerPosition,
          map: mapInstance.current,
          title: "Passenger location",
          label: {
            text: "Passenger",
            className: "pickup-map-label",
            color: "#581c87",
            fontSize: "12px",
            fontWeight: "700",
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#7c3aed",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        });
      } else {
        passengerMarkerRef.current.setPosition(passengerPosition);
      }
    }

    if (routeLineRef.current) {
      routeLineRef.current.setMap(null);
      routeLineRef.current = null;
    }

    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }

    if (currentDriverPosition && pickupPosition) {
      if (!directionsRendererRef.current) {
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          suppressMarkers: true,
          preserveViewport: true,
          polylineOptions: {
            strokeColor: "#2563eb",
            strokeWeight: 6,
            strokeOpacity: 0.95,
          },
        });
        directionsRendererRef.current.setMap(mapInstance.current);
      }

      (directionsServiceRef.current || (directionsServiceRef.current = new google.maps.DirectionsService()))
        .route(
          {
            origin: currentDriverPosition,
            destination: pickupPosition,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsRendererRef.current.setDirections(result);
              const leg = result.routes?.[0]?.legs?.[0];
              if (leg) {
                setRouteInfo({
                  distance: leg.distance?.text,
                  duration: leg.duration?.text,
                });
                setRouteSteps(
                  leg.steps.map((step, index) => ({
                    instruction: step.instructions,
                    distance: step.distance?.text,
                    duration: step.duration?.text,
                    key: `step-${index}`,
                  }))
                );
              }
            } else {
              console.warn("Unable to calculate driver route:", status);
            }
          }
        );
    } else {
      setRouteInfo(null);
      setRouteSteps([]);
    }

    if (passengerPosition && pickupPosition) {
      routeLineRef.current = new google.maps.Polyline({
        path: [pickupPosition, passengerPosition],
        geodesic: true,
        strokeColor: "#7c3aed",
        strokeOpacity: 0.6,
        strokeWeight: 4,
        strokeDasharray: [10, 8],
        map: mapInstance.current,
      });
    }

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(pickupPosition);
    if (currentDriverPosition) bounds.extend(currentDriverPosition);
    if (passengerPosition) bounds.extend(passengerPosition);
    mapInstance.current.fitBounds(bounds, 80);
    mapInstance.current.setOptions({
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      gestureHandling: "greedy",
    });
  };

  const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google?.maps) {
        resolve();
        return;
      }

      const existingScript = document.getElementById("googleMapsScript");
      if (existingScript) {
        existingScript.onload = resolve;
        return;
      }

      const script = document.createElement("script");
      script.id = "googleMapsScript";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Google Maps could not be loaded."));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    if (!socket || !ride?._id) return;
    joinRideRoom(ride._id);

    const handlePassengerLocation = (data) => {
      if (data.rideId !== ride._id) return;
      setPassengerLocation(data.coordinates);
      setIsSharingActive(Boolean(data.coordinates));
      console.log("Passenger live location update:", data.coordinates);
    };

    socket.on("passengerLocationUpdate", handlePassengerLocation);

    return () => {
      socket.off("passengerLocationUpdate", handlePassengerLocation);
    };
  }, [socket, ride, joinRideRoom]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setMapError("Geolocation is not available in this browser.");
      return;
    }

    const startDriverWatch = () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const coords = [position.coords.longitude, position.coords.latitude];
          setDriverLocation(coords);
          if (ride?._id && updateDriverLocation) {
            updateDriverLocation(position.coords.latitude, position.coords.longitude, ride._id);
          }
        },
        (error) => {
          console.error("Driver location watch failed:", error);
          if (error.code === 3) {
            console.warn("Geolocation watch timeout expired, retrying with fallback getCurrentPosition.", error);
            if (watchIdRef.current !== null) {
              navigator.geolocation.clearWatch(watchIdRef.current);
              watchIdRef.current = null;
            }

            navigator.geolocation.getCurrentPosition(
              (position) => {
                const coords = [position.coords.longitude, position.coords.latitude];
                setDriverLocation(coords);
                if (ride?._id && updateDriverLocation) {
                  updateDriverLocation(position.coords.latitude, position.coords.longitude, ride._id);
                }
                startDriverWatch();
              },
              (fallbackError) => {
                console.error("Fallback getCurrentPosition failed:", fallbackError);
                if (fallbackError.code === 1) {
                  setMapError("Location access is blocked. Please allow geolocation for this app.");
                } else {
                  setMapError(`Driver location error: ${fallbackError.message}`);
                }
              },
              { enableHighAccuracy: false, timeout: 20000, maximumAge: 15000 }
            );
          } else if (error.code === 1) {
            setMapError("Location access is blocked. Please allow geolocation for this app.");
          } else {
            setMapError(`Driver location error: ${error.message}`);
          }
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
      );
    };

    startDriverWatch();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [ride?._id, updateDriverLocation]);

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        if (!mapRef.current) return;
        const google = window.google;
        const pickupPosition = getCoordinatePair(ride?.pickupCoordinates) || { lat: 6.5244, lng: 3.3792 };
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: pickupPosition,
          zoom: 14,
          disableDefaultUI: true,
        });
        updateMapMarkers();
      })
      .catch((error) => {
        console.error(error);
        setMapError("Unable to load the map right now.");
      });
  }, [ride?._id, ride?.pickupCoordinates]);

  useEffect(() => {
    if (!mapInstance.current || !window.google?.maps) return;
    updateMapMarkers();
  }, [driverLocation, passengerLocation, ride?.pickupCoordinates]);

  useEffect(() => {
    updateMapMarkers();
  }, [passengerLocation, ride?.pickupCoordinates]);

  const focusOnRoute = () => {
    if (!mapInstance.current) return;

    const google = window.google;
    if (!google?.maps) return;

    const pickupPosition = getCoordinatePair(ride?.pickupCoordinates);
    const passengerPosition = passengerLocation ? { lat: passengerLocation[1], lng: passengerLocation[0] } : null;
    const driverPosition = driverLocation ? { lat: driverLocation[1], lng: driverLocation[0] } : null;

    const bounds = new google.maps.LatLngBounds();
    if (pickupPosition) bounds.extend(pickupPosition);
    if (driverPosition) bounds.extend(driverPosition);
    if (passengerPosition) bounds.extend(passengerPosition);

    if (!bounds.isEmpty()) {
      mapInstance.current.fitBounds(bounds, 80);
    }

    setShowNavigationPanel(true);
  };

  const handleStartRide = async () => {
    try {
      let response;

      // Determine the API endpoint based on activeTab
      if (activeTab === "rides") {
        response = await axios.put(
          `${BaseURL}/rides/status/${ride._id}`,
          { status: "running" },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else if (activeTab === "intercity") {
        response = await axios.put(
          `${BaseURL}/intercityrides/status/${ride._id}`,
          { status: "running" },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else if (activeTab === "packages") {
        response = await axios.put(
          `${BaseURL}/package/status/${ride._id}`,
          { status: "running" },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (response.status === 200) {
        toast.success("Ride started successfully!");
        if (navigator.geolocation && updateDriverLocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              updateDriverLocation(position.coords.latitude, position.coords.longitude, ride._id);
            },
            (error) => {
              console.warn("Could not fetch current driver location on Go:", error);
            },
            { enableHighAccuracy: true }
          );
        }
        navigate("/d/end", { state: { ride, activeTab } });
      } else {
        toast.error("Failed to start the ride. Please try again.");
      }
    } catch (error) {
      toast.error("Error starting the ride. Please try again.");
      console.error("Error starting the ride:", error);
    }
  };

  const handleEmergencyCall = async () => {
    setIsCallingEmergency(true);
    try {
      // Get current location
      const coords = await emergencyCallService.getCurrentLocation();
      
      // Trigger emergency assist on backend
      await emergencyCallService.triggerEmergencyAssist(ride._id, coords);
      
      // Get emergency contacts and call
      const contacts = await emergencyCallService.getEmergencyContacts();
      
      if (contacts && contacts.length > 0) {
        // Call the first emergency contact (usually police/priority contact)
        const primaryContact = contacts.find(c => c.contactType === "police") || contacts[0];
        if (primaryContact?.phone) {
          await emergencyCallService.callEmergencyContact(primaryContact.phone, primaryContact.name);
        }
      }
      
      setShowEmergencyOptions(false);
    } catch (error) {
      console.error("Emergency call error:", error);
    } finally {
      setIsCallingEmergency(false);
    }
  };

  const handleQuickEmergencyAlert = async () => {
    try {
      const coords = await emergencyCallService.getCurrentLocation();
      await emergencyCallService.triggerEmergencyAssist(ride._id, coords);
      setShowEmergencyOptions(false);
    } catch (error) {
      console.error("Error sending emergency alert:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-100">
        <div className="relative h-[80vh]">
          <div ref={mapRef} className="w-full h-full" />
          {mapError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <p className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow">{mapError}</p>
            </div>
          ) : null}
          <div className="absolute inset-0 flex justify-between items-center p-4">
            <div className="bg-white shadow-lg rounded-lg p-6 max-w-[282px]">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex flex-col justify-center items-center w-full gap-1">
                  <div className="w-10 h-10 bg-primaryPurple rounded-full flex items-center justify-center text-white overflow-hidden">
                    {ride.user?.profilePicture ? (
                      <img src={ride.user.profilePicture} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <MdOutlinePersonOutline size={25} />
                    )}
                  </div>
                  <h2 className="text-[16px] font-[600]">
                    {ride.user ? `${ride.user.firstName} ${ride.user.lastName}` : (ride.driverName || "MoovR X")}
                  </h2>
                  <p className="font-[600] text-[24px]">
                    <span className="text-[14px] mr-1">₦</span>
                    {ride.fare || ride.price || 0}
                  </p>
                  <p className="text-[12px] text-black/50">Includes 5% tax</p>
                  <p className="flex items-center gap-2 text-[12px] text-black">
                    <IoIosStar className="text-primaryPurple" />{" "}
                    {ride.rating || 4.3} {ride.paymentMethod || "Cash"} Payment
                  </p>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <img
                  className="mt-2"
                  src="/driver/horizontal-sm-connector.svg"
                  alt=""
                />
                <div>
                  <div className="mb-4 text-black text-[16px]">
                    <p>
                      <span>
                        {ride.timeToPickup || "5 mins"} (
                        {ride.distanceToPickup || "1.3km"})
                      </span>{" "}
                      away
                    </p>
                    <p className="text-[12px] text-black/50">
                      {ride.pickupLocation}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span>
                        {ride.estimatedTime || "15 mins"} (
                        {ride.estimatedDistance || "4.5km"})
                      </span>{" "}
                      trip
                    </p>
                    <p className="text-[12px] text-black/50">
                      Dropoff: {ride.dropoffLocation}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${isSharingActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${isSharingActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                      {isSharingActive ? "Sharing active" : "Waiting for share"}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          focusOnRoute();
                          setShowNavigationPanel((prev) => !prev);
                        }}
                        className="rounded-full border border-primaryPurple/20 bg-white px-3 py-1 text-xs font-semibold text-primaryPurple"
                      >
                        {showNavigationPanel ? "Hide navigation" : "Start navigation"}
                      </button>
                      <button
                        onClick={async () => {
                          if (!ride?._id) {
                            return toast.error("Ride data not available for sharing.");
                          }
                          if (activeTab !== "rides") {
                            return toast.error("Share link is only available for ride trips.");
                          }

                          setCreatingShare(true);
                          try {
                            const resp = await axios.post(`${BaseURL}/rides/share/${ride._id}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
                            const link = resp.data.shareLink;
                            setShareLink(link);
                            await navigator.clipboard.writeText(link);
                            toast.success("Share link copied to clipboard");
                          } catch (err) {
                            console.error("Create share failed:", err);
                            toast.error(err.response?.data?.message || "Failed to create share link");
                          } finally {
                            setCreatingShare(false);
                          }
                        }}
                        className="rounded-full border border-primaryPurple/20 bg-white px-3 py-1 text-xs font-semibold text-primaryPurple"
                        disabled={creatingShare}
                      >
                        {creatingShare ? "Creating..." : "Share trip"}
                      </button>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">Driver navigation</p>
                        <p className="mt-1 text-sm text-slate-500">Route from your current location to the pickup point.</p>
                      </div>
                      {routeInfo?.distance && routeInfo?.duration ? (
                        <div className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
                          {routeInfo.distance} • {routeInfo.duration}
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="font-medium text-slate-900">Distance</p>
                        <p>{routeInfo?.distance || "Calculating..."}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="font-medium text-slate-900">ETA</p>
                        <p>{routeInfo?.duration || "Calculating..."}</p>
                      </div>
                    </div>
                    {showNavigationPanel && routeSteps.length > 0 ? (
                      <div className="mt-4 space-y-3 text-left text-[12px] text-slate-700">
                        <p className="font-semibold text-slate-900">Turn-by-turn directions</p>
                        {routeSteps.slice(0, 6).map((step, index) => (
                          <div key={step.key} className="rounded-2xl bg-slate-50 p-3">
                            <p className="font-semibold text-slate-900">Step {index + 1}</p>
                            <p className="mt-1 text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: step.instruction }} />
                            <p className="mt-1 text-xs text-slate-500">{step.distance} · {step.duration}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {passengerLocation && (
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-700">
                      <p className="font-semibold mb-1">Passenger live location</p>
                      <p>
                        Latitude: <span className="font-medium">{passengerLocation[1] ?? passengerLocation[0]}</span>
                      </p>
                      <p>
                        Longitude: <span className="font-medium">{passengerLocation[0] ?? "N/A"}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleStartRide}
                  className="bg-primaryPurple text-white w-full py-4 font-[600] rounded-full hover:bg-primaryPurple/90 transition-colors"
                >
                  Start Ride
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowEmergencyOptions(!showEmergencyOptions)}
                    disabled={isCallingEmergency}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white w-full py-3 font-[600] rounded-full flex items-center justify-center gap-2 transition-colors"
                    title="Emergency assistance"
                  >
                    <MdEmergency size={20} />
                    Emergency
                  </button>

                  {/* Emergency Options Panel */}
                  {showEmergencyOptions && (
                    <div className="absolute bottom-full right-0 left-0 mb-2 bg-white rounded-lg shadow-xl p-3 border-l-4 border-red-500 z-50">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <MdEmergency className="text-red-500" size={16} />
                        Emergency
                      </h3>
                      
                      <button
                        onClick={handleEmergencyCall}
                        disabled={isCallingEmergency}
                        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-2 px-3 rounded-lg font-medium mb-2 flex items-center justify-center gap-2 transition-colors text-sm"
                      >
                        <FaPhone size={14} />
                        {isCallingEmergency ? "Calling..." : "Call Emergency Contact"}
                      </button>

                      <button
                        onClick={handleQuickEmergencyAlert}
                        disabled={isCallingEmergency}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm"
                      >
                        <MdEmergency size={14} />
                        Send Emergency Alert
                      </button>

                      <button
                        onClick={() => setShowEmergencyOptions(false)}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 rounded-lg font-medium mt-2 text-sm"
                      >
                        Close
                      </button>

                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Location shared with passenger and authorities
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reached;
