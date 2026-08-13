import { BaseURL } from "../utils/BaseURL";
import toast from "react-hot-toast";

/**
 * Emergency Call Service
 * Handles emergency contact calls and emergency assist triggering
 */

export const emergencyCallService = {
  /**
   * Trigger emergency assist for current ride
   * @param {string} rideId - The ID of the active ride
   * @param {object} coords - Current coordinates {latitude, longitude}
   * @returns {Promise<object>} Response with emergency details
   */
  async triggerEmergencyAssist(rideId, coords = null) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${BaseURL}/emergency/assist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rideId, coords }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to trigger emergency assist");
      }

      const data = await response.json();
      toast.success("Emergency contacts notified!");
      return data;
    } catch (error) {
      console.error("Emergency assist error:", error);
      toast.error(error.message || "Failed to trigger emergency assist");
      throw error;
    }
  },

  /**
   * Get user's emergency contacts from backend
   * @returns {Promise<array>} Array of emergency contacts
   */
  async getEmergencyContacts() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${BaseURL}/emergency/contacts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch emergency contacts");
      }

      const data = await response.json();
      return data.emergencyContacts || [];
    } catch (error) {
      console.error("Failed to fetch emergency contacts:", error);
      return [];
    }
  },

  /**
   * Initiate direct call to emergency contact
   * Note: Actual calling functionality depends on device capabilities
   * @param {string} phoneNumber - Phone number to call
   * @param {string} contactName - Name of the contact
   */
  async callEmergencyContact(phoneNumber, contactName = "Emergency Contact") {
    try {
      if (!phoneNumber) {
        throw new Error("Phone number not available");
      }

      // On web, we can only trigger the phone dial link
      // On mobile apps, this would use native calling APIs
      const telLink = `tel:${phoneNumber}`;

      // For Android and iOS apps, this will trigger the native dialer
      // For web browsers, behavior depends on the browser
      if (navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod/i)) {
        // Mobile device - trigger native dialer
        window.location.href = telLink;
      } else {
        // Desktop - attempt to use platform-specific handlers
        try {
          window.open(telLink);
          toast.success(`Calling ${contactName}`);
        } catch (e) {
          throw new Error("Calling is not supported in your browser");
        }
      }
    } catch (error) {
      console.error("Call error:", error);
      toast.error(error.message || "Unable to initiate call");
      throw error;
    }
  },

  /**
   * Show emergency contacts modal/options
   * Useful for letting user choose which contact to call
   * @returns {Promise<string>} Selected phone number
   */
  async selectAndCallEmergencyContact() {
    try {
      const contacts = await this.getEmergencyContacts();

      if (!contacts || contacts.length === 0) {
        toast.error("No emergency contacts configured. Please set them up in your profile.");
        return null;
      }

      // Create a simple selection prompt
      // In a real app, you'd want a proper modal component
      const contactOptions = contacts
        .map((c, i) => `${i + 1}. ${c.name || "Contact"} - ${c.phone}`)
        .join("\n");

      const selected = prompt(
        `Select emergency contact to call:\n\n${contactOptions}\n\nEnter number (e.g., 1, 2, 3):`,
        "1"
      );

      if (!selected) return null;

      const contactIndex = parseInt(selected) - 1;
      if (contactIndex < 0 || contactIndex >= contacts.length) {
        throw new Error("Invalid selection");
      }

      const selectedContact = contacts[contactIndex];
      await this.callEmergencyContact(selectedContact.phone, selectedContact.name);
      return selectedContact.phone;
    } catch (error) {
      console.error("Error in emergency contact selection:", error);
      toast.error(error.message || "Failed to process emergency contact");
      throw error;
    }
  },

  /**
   * Send SMS to emergency contacts (if backend supports)
   * @param {string} rideId - Ride ID for context
   * @param {string} message - Message to send
   */
  async sendEmergencySMS(rideId, message = "I need help!") {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${BaseURL}/emergency/send-sms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rideId, message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send SMS");
      }

      toast.success("Emergency SMS sent!");
      return await response.json();
    } catch (error) {
      console.error("SMS sending error:", error);
      // Don't show error toast for SMS as calling should be primary method
      console.warn(error.message);
    }
  },

  /**
   * Get current user location for emergency
   * @returns {Promise<object>} Location object {latitude, longitude}
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          reject(error);
        }
      );
    });
  },
};

export default emergencyCallService;
