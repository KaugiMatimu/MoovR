import React, { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";

// Create the context
const SocketContext = createContext();

// Your server URL where Socket.io is running
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, "") : null) ||
  "http://localhost:5000";

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize the socket connection with explicit open/close handling
    const socketInstance = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    setSocket(socketInstance);

    const connectSocket = () => {
      if (socketInstance && !socketInstance.connected && !socketInstance.connecting) {
        socketInstance.open();
      }
    };

    socketInstance.on("connect", () => {
      console.log("Socket connected to", SOCKET_URL, "id=", socketInstance.id);
      const storedUser = JSON.parse(localStorage.getItem("user") || localStorage.getItem("userData") || "{}");
      const userId = storedUser?._id || storedUser?.id;
      if (userId) {
        socketInstance.emit("join", userId);
      }
    });
    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
    socketInstance.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });

    const handlePageShow = (event) => {
      if (event?.persisted) {
        window.setTimeout(connectSocket, 100);
      }
    };

    const handlePageHide = (event) => {
      if (socketInstance && socketInstance.connected && !event?.persisted) {
        socketInstance.disconnect();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);

    connectSocket();

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pagehide", handlePageHide);
      socketInstance.disconnect();
    };
  }, []);

  const updateDriverLocation = (latitude, longitude, rideId = null) => {
    if (socket) {
      const storedUser = JSON.parse(localStorage.getItem("user") || localStorage.getItem("userData") || "{}");
      const userId = storedUser?._id || storedUser?.id;
      const coordinates = [parseFloat(longitude), parseFloat(latitude)];
      console.log("Sending location:", { userId, coordinates, rideId }); // Debugging log
      socket.emit("updateLocation", { driverId: userId, coordinates, rideId });
    }
  };

  const joinRideRoom = (rideId) => {
    if (socket && rideId) {
      socket.emit("joinRide", rideId);
    }
  };

  // Continuous location update if geolocation changes (like watching position)
  useEffect(() => {
    let watcherId = null;

    const startLocationTracking = async () => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        return;
      }

      try {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        if (permission.state === "denied") {
          console.info("Geolocation permission denied. Location tracking is disabled.");
          return;
        }
      } catch (error) {
        // Browser does not support Permissions API; continue with watchPosition.
      }

      watcherId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateDriverLocation(latitude, longitude);
        },
        (error) => {
          if (error.code === 1) {
            console.info("Geolocation permission denied. Location tracking disabled.");
          } else {
            console.error("Error fetching location:", error);
          }
        },
        { enableHighAccuracy: true }
      );
    };

    startLocationTracking();

    return () => {
      if (watcherId !== null) {
        navigator.geolocation.clearWatch(watcherId);
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, updateDriverLocation, joinRideRoom }}>
      {children}
    </SocketContext.Provider>
  );
};
