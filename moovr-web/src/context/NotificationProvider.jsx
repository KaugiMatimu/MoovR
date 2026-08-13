import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSocket } from "./LocationProvider";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import notificationSoundService from "../services/notificationSoundService";

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:5000/api/v1/notifications";

  const getAuthHeaders = () => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const token = localStorage.getItem("token") || userData.token;
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchNotifications = useCallback(async () => {
    const userData = localStorage.getItem("userData");
    if (!userData) return;

    setLoading(true);
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/read`, {}, getAuthHeaders());
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/mark-all-read`, {}, getAuthHeaders());
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
      const deletedNotif = notifications.find((n) => n._id === id);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      console.log("Real-time notification received:", data);
      
      // Play notification sound based on type
      if (data.type === "emergencyAlert" || data.type === "driverEmergency") {
        notificationSoundService.play("emergency");
      } else if (data.type === "newRide" || data.type === "rideRequest") {
        notificationSoundService.play("rideRequest");
      } else {
        notificationSoundService.play("notification");
      }

      // Show browser notification if supported
      if (data.type === "emergencyAlert" || data.type === "driverEmergency") {
        notificationSoundService.showBrowserNotification("🚨 " + (data.title || "Emergency Alert"), {
          body: data.message || "Emergency assistance needed",
          tag: "emergency-" + Date.now(),
          requireInteraction: true,
        });
      } else if (data.type === "newRide" || data.type === "rideRequest") {
        notificationSoundService.showBrowserNotification("📍 " + (data.title || "New Ride Request"), {
          body: data.message || "A new ride request is available",
          tag: "ride-" + Date.now(),
        });
      }
      
      // Add to state
      const newNotif = {
        _id: Date.now().toString(), // Temporary ID until refresh
        title: data.title || "New Update",
        message: data.message || "You have a new notification",
        type: data.type || "system",
        createdAt: new Date(),
        isRead: false,
        data: data
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      const isRideCompletePrompt = newNotif.type === "rateDriverPrompt" || (newNotif.type === "rideStatusUpdated" && data.status === "completed");
      if (isRideCompletePrompt && window.location.pathname !== "/ride/completed") {
        navigate("/ride/completed", {
          state: {
            rideId: data._id,
            ride: data,
            driverId: data.driver?._id || data.driver,
            driverName: data.driver?.firstName ? `${data.driver.firstName} ${data.driver.lastName}` : "Driver",
          },
        });
      }

      // Show specialized toast for ride completion/rating
      if (isRideCompletePrompt) {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="font-bold">{newNotif.title}</span>
            <span>{newNotif.message}</span>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate("/ride/completed", {
                    state: {
                      rideId: data._id,
                      ride: data,
                      driverId: data.driver?._id || data.driver,
                      driverName: data.driver?.firstName ? `${data.driver.firstName} ${data.driver.lastName}` : "Driver",
                    },
                  });
                }}
                className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm font-medium"
              >
                Rate Now
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-medium"
              >
                Later
              </button>
            </div>
          </div>
        ), {
          duration: 10000,
          position: "top-right",
        });
      } else {
        // Show standard toast
        toast.success(newNotif.message, {
          duration: 5000,
          position: "top-right",
        });
      }
    };

    // Listen to various events that might trigger notifications
    socket.on("newRide", (data) => handleNewNotification({ ...data, type: "newRide", title: "New Ride Request" }));
    socket.on("rideAccepted", (data) => handleNewNotification({ ...data, type: "rideAccepted", title: "Ride Accepted" }));
    socket.on("rideRejected", (data) => handleNewNotification({ ...data, type: "rideRejected", title: "Ride Rejected" }));
    socket.on("rideStatusUpdated", (data) => handleNewNotification({ ...data, type: "rideStatusUpdated", title: "Ride Status Update" }));
    socket.on("rateDriverPrompt", (data) => handleNewNotification({ ...data, type: "rateDriverPrompt", title: "Rate Your Driver" }));
    socket.on("emergencyAlert", (data) => handleNewNotification({ ...data, type: "emergencyAlert", title: "🚨 Emergency Alert" }));
    socket.on("driverEmergency", (data) => handleNewNotification({ ...data, type: "driverEmergency", title: "🚨 Driver Emergency" }));
    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("newRide");
      socket.off("rideAccepted");
      socket.off("rideRejected");
      socket.off("rideStatusUpdated");
      socket.off("rateDriverPrompt");
      socket.off("emergencyAlert");
      socket.off("driverEmergency");
      socket.off("notification");
    };
  }, [socket]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
