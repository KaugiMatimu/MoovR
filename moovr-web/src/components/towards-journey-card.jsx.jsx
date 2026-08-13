import React, { useState } from "react";
import { FaStar, FaPhone } from "react-icons/fa";
import { MdEmergency } from "react-icons/md";
import emergencyCallService from "../../services/emergencyCallService";

const TowardsJourney = ({ rideId, onCancel }) => {
  const [isCallingEmergency, setIsCallingEmergency] = useState(false);
  const [showEmergencyOptions, setShowEmergencyOptions] = useState(false);

  const handleEmergencyCall = async () => {
    setIsCallingEmergency(true);
    try {
      // Get current location
      const coords = await emergencyCallService.getCurrentLocation();
      
      // Trigger emergency assist on backend
      await emergencyCallService.triggerEmergencyAssist(rideId, coords);
      
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
      await emergencyCallService.triggerEmergencyAssist(rideId, coords);
      setShowEmergencyOptions(false);
    } catch (error) {
      console.error("Error sending emergency alert:", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 w-[350px] flex flex-col items-center space-y-4 relative">
      {/* Title */}
      <h2 className="text-center text-lg font-semibold text-gray-700">
        Towards destination
      </h2>

      {/* Estimated Time */}
      <div className="flex items-center justify-between w-full px-4">
        <span className="text-gray-400">Estimated time</span>
        <span className="text-sm font-semibold text-purple-500 bg-purple-100 px-3 py-1 rounded-full">
          05 min
        </span>
      </div>

      {/* Driver Info */}
      <div className="flex items-center w-full justify-around mt-2">
        {/* Driver Profile with Rating */}
        <div className="relative flex items-center space-x-2">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
            <img
              src="/images/avatar.png" // Replace with the driver image
              alt="Driver"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <span className="font-semibold text-gray-800">Adewale</span>
            <p className="text-sm text-gray-500">Driver</p>
          </div>
          <div className="absolute -bottom-2 left-0 transform translate-x-2 bg-purple-100 text-purple-500 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
            <FaStar className="text-yellow-500 w-3 h-3" />
            <span>4.9</span>
          </div>
        </div>

        <img
          src="/images/driver/straight-car.png" // Replace with car image
          alt="Car"
          className="w-24 h-12 object-cover"
        />

        {/* Car Information */}
        <div className="text-center">
          <span className="font-semibold text-gray-800 block">82BG879</span>
          <p className="text-sm text-gray-500">Silver Honda Civic</p>
        </div>
      </div>

      <div className="flex gap-5 w-full">
        <button 
          onClick={onCancel}
          className="bg-babyPurple text-primaryPurple w-full py-3 rounded-full font-medium hover:opacity-80 transition-opacity"
        >
          Cancel Ride
        </button>
        
        <button
          onClick={() => setShowEmergencyOptions(!showEmergencyOptions)}
          disabled={isCallingEmergency}
          className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white p-3 rounded-full transition-colors flex items-center justify-center"
          title="Emergency assistance"
        >
          {showEmergencyOptions ? (
            <FaPhone size={20} />
          ) : (
            <MdEmergency size={20} />
          )}
        </button>
      </div>

      {/* Emergency Options Panel */}
      {showEmergencyOptions && (
        <div className="absolute bottom-32 left-0 right-0 mx-auto w-[350px] bg-white rounded-lg shadow-xl p-4 border-l-4 border-red-500 z-50">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <MdEmergency className="text-red-500" />
            Emergency Options
          </h3>
          
          <button
            onClick={handleEmergencyCall}
            disabled={isCallingEmergency}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-2 px-4 rounded-lg font-medium mb-2 flex items-center justify-center gap-2 transition-colors"
          >
            <FaPhone size={16} />
            {isCallingEmergency ? "Calling..." : "Call Emergency Contact"}
          </button>

          <button
            onClick={handleQuickEmergencyAlert}
            disabled={isCallingEmergency}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <MdEmergency size={16} />
            Send Emergency Alert
          </button>

          <button
            onClick={() => setShowEmergencyOptions(false)}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium mt-2"
          >
            Close
          </button>

          <p className="text-xs text-gray-500 mt-3 text-center">
            Your location will be shared with emergency contacts and driver
          </p>
        </div>
      )}
    </div>
  );
};

export default TowardsJourney;
