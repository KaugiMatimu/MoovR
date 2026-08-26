import React, { useState, useRef, useEffect } from "react";
import Header from "../../../components/user-panel/header";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { BaseURL } from "../../../utils/BaseURL";
import io from "socket.io-client"; // Import Socket.io client

const TrackPackage = () => {
  const location = useLocation();
  const { pkg } = location.state || {};
  const [driverLocation, setDriverLocation] = useState(null);
  const [isMapsReady, setIsMapsReady] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const driverMarker = useRef(null);
  const socketRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  useEffect(() => {
    // Use the same production socket host as the shared provider.
    const socketUrl = import.meta.env.VITE_SOCKET_URL || BaseURL.split("/api")[0];
    socketRef.current = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const connectSocket = () => {
      if (socketRef.current && !socketRef.current.connected && !socketRef.current.connecting) {
        socketRef.current.connect();
      }
    };

    socketRef.current.on("connect", () => {
      console.log("Connected to socket server with ID:", socketRef.current.id);
      if (pkg?._id) {
        socketRef.current.emit("joinPackage", pkg._id);
      }
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socketRef.current.on("driverLocationUpdate", (data) => {
      console.log("Driver location updated:", data);
      const { driverId, coordinates } = data;
      
      // If the package has an assigned driver, only update if it's the correct driver
      if (pkg?.driver && pkg.driver !== driverId) return;

      if (coordinates && Array.isArray(coordinates)) {
        const pos = { lat: coordinates[1], lng: coordinates[0] };
        setDriverLocation(pos);

        if (mapInstance.current && window.google) {
          const google = window.google;

          if (!driverMarker.current) {
            driverMarker.current = new google.maps.Marker({
              position: pos,
              map: mapInstance.current,
              icon: {
                url: "/icons/ride/car-top.png",
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20),
              },
              title: "Driver",
            });
          } else {
            driverMarker.current.setPosition(pos);
          }
        }
      }
    });

    const handlePageShow = (event) => {
      if (event?.persisted) {
        window.setTimeout(connectSocket, 100);
      }
    };

    const handlePageHide = (event) => {
      if (socketRef.current && socketRef.current.connected && !event?.persisted) {
        socketRef.current.disconnect();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);

    connectSocket();

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pagehide", handlePageHide);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [pkg?._id]);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!window.google) {
        const script = document.createElement("script");
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (window.google && window.google.maps) {
            initializeMap();
          }
        };
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      const google = window.google;
      const center = pkg?.pickupCoordinates?.coordinates 
        ? { lat: pkg.pickupCoordinates.coordinates[1], lng: pkg.pickupCoordinates.coordinates[0] }
        : { lat: 51.505, lng: -0.09 };

      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: center,
        zoom: 13,
        disableDefaultUI: true,
      });

      directionsServiceRef.current = new google.maps.DirectionsService();
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: mapInstance.current,
        suppressMarkers: false,
      });

      if (pkg?.pickupCoordinates && pkg?.dropoffCoordinates) {
        const origin = {
          lat: pkg.pickupCoordinates.coordinates[1],
          lng: pkg.pickupCoordinates.coordinates[0],
        };
        const destination = {
          lat: pkg.dropoffCoordinates.coordinates[1],
          lng: pkg.dropoffCoordinates.coordinates[0],
        };

        directionsServiceRef.current.route(
          {
            origin,
            destination,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === "OK") {
              directionsRendererRef.current.setDirections(result);
            } else {
              console.error("Directions request failed:", status);
            }
          }
        );
      }

      setIsMapsReady(true);
    };

    loadGoogleMapsScript();
  }, [pkg]);

  return (
    <div className="h-screen w-screen flex flex-col">
      <Header />
      <div className="flex-1 relative">
        <Link
          to={"/package"}
          className="absolute top-4 left-4 z-10 flex items-center bg-white p-2 rounded-full shadow-md"
        >
          <FaArrowLeft className="text-lg mr-2" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        <div ref={mapRef} className="w-full h-full" />

        {pkg && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-xl shadow-xl w-[90%] max-w-md">
            <h3 className="font-bold text-lg mb-2">Tracking Package</h3>
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <span className="text-gray-600">Status</span>
              <span className="font-semibold text-purple-600 uppercase">{pkg.status}</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm"><span className="font-medium">From:</span> {pkg.pickupLocation}</p>
              <p className="text-sm"><span className="font-medium">To:</span> {pkg.dropoffLocation}</p>
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default TrackPackage;
