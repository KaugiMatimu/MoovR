import React, { useState, useEffect } from "react";
import { BiArrowBack } from "react-icons/bi";
import { FaUserCircle } from "react-icons/fa";
import Header from "../../../components/driver-panel/header";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../../utils/BaseURL";
import { DotLoader } from "react-spinners";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import HeaderUser from "../../../components/user-panel/header";
import { useLanguage } from "../../../context/LanguageContext.jsx";

const UserSettings = () => {
   
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
const role = Cookies.get("role");
  // ✅ Load theme from localStorage on mount
useEffect(() => {
  document.documentElement.classList.toggle("dark", theme === "dark");
}, [theme]);


  // ✅ Toggle and store theme in localStorage and <html> tag
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const toggleNotifications = () => setNotificationsEnabled(!notificationsEnabled);
  const toggleEmailAlerts = () => setEmailAlertsEnabled(!emailAlertsEnabled);

  useEffect(() => {
    const fetchUserData = async () => {
      
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(`${BaseURL}/auth/get-user`, {
          headers: { Authorization: `Bearer ${token}` },
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


  console.log("your role in the user setting screen :",role);
  const profileImage = user?.profilePicture || "/images/avatar.png";
  const { t, languageName } = useLanguage();
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("token");
    const loadingToast = toast.loading("Uploading image...");

    try {
      const { data } = await axios.put(`${BaseURL}/auth/update-user/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("✅ Profile picture updated!", { id: loadingToast });
      const updatedUser = { ...user, profilePicture: data.imageUrl };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Upload error", error);
      toast.error("❌ Upload failed", { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <DotLoader size={60} color="#4F46E5" />
      </div>
    );
  }

  return (
    <div className="text-start text-gray-700">
      {
      
        role==="user"? <HeaderUser/> :<Header />
       }
      <div className="p-4 sm:p-6 max-w-5xl mx-auto dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="flex gap-3 items-center mb-6 sm:mb-8 cursor-pointer py-2 px-3 rounded-[12px] w-fit hover:bg-gray-100"
        >
          <BiArrowBack size={23} /> 
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-24 justify-center">
          <div>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="relative group">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="h-24 w-24 sm:h-[120px] sm:w-[120px] border border-black rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="h-24 w-24 sm:h-[120px] sm:w-[120px] text-gray-400" />
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <span className="text-xs font-semibold">Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-start">
                <h2 className="text-lg sm:text-2xl font-semibold">{fullName}</h2>
                <p className="text-sm text-gray-500">{user?.phone}</p>
                <button className="text-primaryPurple text-sm underline mt-2">
                  Change password
                </button>
              </div>
            </div>

            <div className="mb-8 space-y-3 text-[16px]">
              <div className="flex justify-between mb-6 items-center">
                <h3 className="font-[600]">Account details</h3>
                <button onClick={() => setIsModalOpen(true)}>
                  <img src="/icons/settings/edit.svg" alt="Edit" className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                First Name: {user?.firstName} <br />
                Last Name: {user?.lastName} <br />
                Phone: {user?.phone} <br />
                Email: {user?.email}
              </p>
            </div>

            <div className="mb-8 space-y-3 text-sm sm:text-base">
              <div className="flex justify-between mb-6 items-center">
                <div>
                  <h3 className="font-[600]">Emergency contacts</h3>
                  <p className="text-sm text-gray-500">Add a trusted person and keep the police emergency number ready.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)}>
                  <img src="/icons/settings/edit.svg" alt="Edit" className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Trusted person: {user?.emergencyContact?.contactType === "trusted" ? user.emergencyContact.name : "Not set"} <br />
                Phone: {user?.emergencyContact?.contactType === "trusted" ? user.emergencyContact.phone : "Not set"}
              </p>
              <p className="text-sm text-gray-500">
                Police emergency: <span className="font-semibold">911</span>
              </p>
            </div>

            <div className="mb-6 sm:mb-8 space-y-3 text-sm sm:text-base">
              <div className="flex justify-between mb-4 sm:mb-6 items-center">
                <h3 className="font-semibold">Language</h3>
                <Link to="/languages">
                  <button>
                    <img src="/icons/settings/edit.svg" alt="Edit" />
                  </button>
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 justify-between items-center">
                <p>{t("currentLanguage")}</p>
                <input
                  type="text"
                  value={languageName}
                  readOnly
                  className="focus:outline-none w-full sm:w-auto bg-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="font-semibold">Theme</h3>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full flex items-center px-1 ${theme === "light" ? "bg-gray-200" : "bg-gray-700"}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${
                    theme === "dark" ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            <div className="mb-6 sm:mb-8">
              <h3 className="font-semibold">Notifications</h3>
              {[{ label: "Enable notifications", state: notificationsEnabled, toggle: toggleNotifications },
                { label: "Email alerts", state: emailAlertsEnabled, toggle: toggleEmailAlerts }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center mt-4">
                  <span>{item.label}</span>
                  <button
                    onClick={item.toggle}
                    className={`w-12 h-6 rounded-full flex items-center px-1 ${item.state ? "bg-purple-600" : "bg-gray-200"}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${item.state ? "translate-x-6" : ""}`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="mb-6 sm:mb-8">
              <h3 className="font-semibold">Support and feedback</h3>
              <div className="flex flex-col gap-2 mt-4">
                {[{ label: "Contact support", action: "Contact" },
                  { label: "Report an issue", action: "Report" },
                  { label: "Submit feedback", action: "Submit" }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.label}</span>
                    <button className="text-purple-600">{item.action}</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="font-semibold">App version</h3>
              <span>Version 2.0.13</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-start">
              <div>
                <h3 className="font-semibold">Delete account?</h3>
                <p className="text-sm text-gray-500">Do you want to delete your account permanently?</p>
              </div>
              <button className="mt-4 sm:mt-0 text-primaryPurple px-6 py-2 rounded-full bg-lightPurple text-sm sm:text-base font-semibold">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && <EditModal user={user} onUpdate={setUser} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

const EditModal = ({ user, onUpdate, onClose }) => {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email || "");
  const [trustedContactName, setTrustedContactName] = useState(
    user.emergencyContact?.contactType === "trusted" ? user.emergencyContact.name : ""
  );
  const [trustedContactPhone, setTrustedContactPhone] = useState(
    user.emergencyContact?.contactType === "trusted" ? user.emergencyContact.phone : ""
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!trustedContactName.trim() || !trustedContactPhone.trim()) {
      toast.error("Please add a trusted emergency contact name and phone number.");
      return;
    }

    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const { data } = await axios.put(
        `${BaseURL}/auth/update-user`,
        {
          firstName,
          lastName,
          phone,
          email,
          emergencyContactType: "trusted",
          emergencyContactName: trustedContactName.trim(),
          emergencyContactPhone: trustedContactPhone.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Profile updated!");
      localStorage.setItem("user", JSON.stringify(data.user));
      onUpdate(data.user);
      onClose();
    } catch (error) {
      console.error("Save error", error);
      toast.error("❌ Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-black w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        <div className="space-y-3">
          <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border p-2 rounded" />
          <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border p-2 rounded" />
          <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border p-2 rounded" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded" />
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2">Trusted emergency contact</label>
            <input
              type="text"
              placeholder="Trusted Contact Name"
              value={trustedContactName}
              onChange={(e) => setTrustedContactName(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />
            <input
              type="text"
              placeholder="Trusted Contact Phone"
              value={trustedContactPhone}
              onChange={(e) => setTrustedContactPhone(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="p-3 rounded border border-gray-200 bg-gray-50 text-sm text-gray-700">
            Police emergency number is fixed as <span className="font-semibold">911</span>.
          </div>
        </div>
        <div className="flex justify-end mt-4 space-x-3">
          <button onClick={onClose} className="text-gray-600">Cancel</button>
          <button type="button" onClick={handleSave} disabled={saving} className="bg-purple-600 text-white px-4 py-2 rounded">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
