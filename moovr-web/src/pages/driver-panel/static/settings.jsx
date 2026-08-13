import React, { useState, useEffect } from "react";
import { BiArrowBack } from "react-icons/bi";
import { FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { DotLoader } from "react-spinners";
import toast from "react-hot-toast";

// Replace this with your actual base URL
import { BaseURL } from "../../../utils/BaseURL";

const AccountDetailsModal = ({ setIsModalOpen, onUpdate }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContactType, setEmergencyContactType] = useState("police");
  const [emergencyContactName, setEmergencyContactName] = useState("Police");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("911");
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setEmergencyContactType(user.emergencyContact?.contactType || "police");
      setEmergencyContactName(user.emergencyContact?.name || "Police");
      setEmergencyContactPhone(user.emergencyContact?.phone || "911");
    }
  }, []);

  useEffect(() => {
    if (emergencyContactType === "police") {
      setEmergencyContactName("Police");
      setEmergencyContactPhone("911");
    }
  }, [emergencyContactType]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(
        `${BaseURL}/auth/update-user`,
        {
          firstName,
          lastName,
          email,
          phone,
          emergencyContactType,
          emergencyContactName,
          emergencyContactPhone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated successfully");
      localStorage.setItem("user", JSON.stringify(data.user));
      onUpdate(data.user);
      setIsModalOpen(false);
    } catch (error) {
      console.log("your error while saving :", error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Account Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">First Name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Last Name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Emergency Contact</label>
            <select
              value={emergencyContactType}
              onChange={(e) => setEmergencyContactType(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="police">Police</option>
              <option value="trusted">Trusted Contact</option>
            </select>
          </div>
          {emergencyContactType === "trusted" ? (
            <>
              <div>
                <label className="block text-sm mb-1">Trusted Contact Name</label>
                <input
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Trusted Contact Phone</label>
                <input
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
            </>
          ) : (
            <div className="p-3 rounded border border-gray-200 bg-gray-50 text-sm text-gray-700">
              Police contact will stay set to 911.
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const DriverSettings = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
  const toggleNotifications = () =>
    setNotificationsEnabled(!notificationsEnabled);
  const toggleEmailAlerts = () =>
    setEmailAlertsEnabled(!emailAlertsEnabled);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(`${BaseURL}/auth/get-user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } catch (error) {
        console.error("Error fetching user data", error);
        toast.error("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <DotLoader size={60} color="#4F46E5" />
      </div>
    );
  }

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const profileImage = user?.profilePicture || "/images/avatar.png";
  const emergencyContact = user?.emergencyContact || { contactType: "police", name: "Police", phone: "911" };

  return (
    <div className="text-start text-gray-700">
      {/* Replace with your Header component or remove if unavailable */}
      <header className="p-4 bg-gray-100 dark:bg-gray-900 font-bold text-xl">Driver Settings</header>

      <div className="p-4 sm:p-6 max-w-5xl mx-auto dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="flex gap-3 items-center mb-6 sm:mb-8 cursor-pointer py-2 px-3 rounded-[12px] w-fit hover:bg-gray-100"
        >
          <BiArrowBack size={23} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-24 justify-center">
          <div>
            {/* Profile Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="h-24 w-24 sm:h-[120px] sm:w-[120px] border border-black rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="h-24 w-24 sm:h-[120px] sm:w-[120px] text-gray-400" />
              )}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-start">
                <h2 className="text-lg sm:text-2xl font-semibold">{fullName}</h2>
                <p className="text-sm text-gray-500">
                  {user?.phone || "+92xxxxxxxxxx"}
                </p>
                <button className="text-primaryPurple text-sm underline mt-2">
                  Change password
                </button>
              </div>
            </div>

            {/* Account Details */}
            <div className="mb-8 space-y-3 text-[16px]">
              <div className="flex justify-between mb-6 items-center">
                <h3 className="font-[600]">Account details</h3>
                <button onClick={() => setIsModalOpen(true)}>
                  <img src="/icons/settings/edit.svg" alt="Edit" />
                </button>
              </div>

              <div className="flex gap-5 items-center">
                <p>Name</p>
                <input
                  type="text"
                  value={fullName}
                  readOnly
                  className="focus:outline-none bg-transparent"
                />
              </div>

              <div className="flex gap-5 items-center">
                <p>Phone</p>
                <input
                  type="text"
                  value={user?.phone || ""}
                  readOnly
                  className="focus:outline-none bg-transparent"
                />
              </div>

              <div className="flex gap-5 items-center">
                <p>Email</p>
                <input
                  type="email"
                  value={user?.email || "email not registered"}
                  readOnly
                  className="focus:outline-none bg-transparent"
                />
              </div>
              <div className="mt-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <h3 className="font-semibold mb-2">Emergency Contact</h3>
                <p className="text-sm text-gray-700">
                  {emergencyContact.contactType === "police" ? "Police" : emergencyContact.name}
                </p>
                <p className="text-sm text-gray-500">{emergencyContact.phone}</p>
              </div>
            </div>

            <div className="mb-6 sm:mb-8 space-y-3 text-sm sm:text-base">
              <div className="flex justify-between mb-4 sm:mb-6 items-center">
                <h3 className="font-semibold">Language</h3>
                <button>
                  <img src="/icons/settings/edit.svg" alt="Edit" />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 justify-between items-center">
                <p>Current language of App.</p>
                <input
                  type="text"
                  value="English"
                  readOnly
                  className="focus:outline-none w-full sm:w-auto bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Theme */}
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="font-semibold">Theme</h3>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full flex items-center px-1 ${
                  theme === "light" ? "bg-gray-200" : "bg-gray-700"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transform ${
                    theme === "dark" && "translate-x-6"
                  }`}
                />
              </button>
            </div>

            {/* Notifications */}
            <div className="mb-6 sm:mb-8">
              <h3 className="font-semibold">Notifications</h3>
              {[
                {
                  label: "Enable notifications",
                  state: notificationsEnabled,
                  toggle: toggleNotifications,
                },
                {
                  label: "Email alerts",
                  state: emailAlertsEnabled,
                  toggle: toggleEmailAlerts,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center mt-4"
                >
                  <span>{item.label}</span>
                  <button
                    onClick={item.toggle}
                    className={`w-12 h-6 rounded-full flex items-center px-1 ${
                      item.state ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transform ${
                        item.state && "translate-x-6"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Support & Feedback */}
            <div className="mb-6 sm:mb-8">
              <h3 className="font-semibold">Support and feedback</h3>
              <div className="flex flex-col gap-2 mt-4">
                {[
                  { label: "Contact support", action: "Contact" },
                  { label: "Report an issue", action: "Report" },
                  { label: "Submit a feedback", action: "Submit" },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.label}</span>
                    <button className="text-purple-600">{item.action}</button>
                  </div>
                ))}
              </div>
            </div>

            {/* App Version */}
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="font-semibold">App version</h3>
              <span>Version 2.0.13</span>
            </div>

            {/* Delete Account */}
            <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-start">
              <div>
                <h3 className="font-semibold">Delete account?</h3>
                <p className="text-sm text-gray-500">
                  Do you want to delete your account permanently?
                </p>
              </div>
              <button className="mt-4 sm:mt-0 text-primaryPurple px-6 py-2 rounded-full bg-lightPurple text-sm sm:text-base font-semibold">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AccountDetailsModal
          setIsModalOpen={setIsModalOpen}
          onUpdate={setUser}
        />
      )}
    </div>
  );
};

export default DriverSettings;
