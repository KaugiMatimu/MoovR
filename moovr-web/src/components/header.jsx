import axios from "axios";
import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaUserCircle } from "react-icons/fa";
import { BaseURL } from "../utils/BaseURL";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNav, setSelectedNav] = useState("Ride");
  const [user, setUser] = useState(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = (navItem) => {
    setSelectedNav(navItem);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await axios.get(`${BaseURL}/auth/get-user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, []);

  const profileImage = user?.profilePicture || "/images/avatar.png";
  const fullName = user?.firstName || user?.lastName 
    ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() 
    : "User";

  return (
    <header className="flex items-center justify-between px-8 pb-5 pt-8 shadow-md bg-white">
      {/* Left Section - Logo */}
      <div className="flex items-center space-x-6">
        <img
          src="/images/logo.svg"
          alt="Logo"
          className="h-[40px] w-auto pr-8"
        />

        {/* Navigation */}
        <nav className="hidden md:flex space-x-9">
          {["Ride", "Rent", "Driver", "Package", "Reserve", "Bill"].map(
            (navItem) => (
              <a
                key={navItem}
                href="#"
                onClick={() => handleNavClick(navItem)}
                className={`flex flex-col items-center justify-center ${
                  selectedNav === navItem ? "text-purple-500" : "text-gray-700"
                }`}
              >
                <img
                  src={`/icons/header/${navItem.toLowerCase()}.svg`}
                  alt={navItem}
                  className={`w-6 h-6 ${
                    selectedNav === navItem ? "text-gray-700" : "text-gray-700"
                  }`}
                />
                <span>{navItem}</span>
              </a>
            )
          )}
        </nav>
      </div>

      <div className="relative">
        {/* Profile Button */}
        <div className="flex items-center justify-center gap-6">
          <img src="/icons/header/wallet.svg" alt="" />
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-2"
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="User"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-10 h-10 text-gray-400" />
            )}
            <span className="text-gray-700">{fullName}</span>
            {isOpen ? (
              <FaChevronUp className="ml-1" />
            ) : (
              <FaChevronDown className="ml-1" />
            )}
          </button>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
            <div className="p-4 border-b flex items-center space-x-2 justify-between">
              <div className="flex items-center space-x-2">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="w-8 h-8 text-gray-400" />
                )}
                <span className="text-gray-700">{fullName}</span>
              </div>
              <img src="/icons/header/pad.svg" alt="" />
            </div>
            <ul className="py-2">
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-4">
                <img src="/icons/header/account.svg" alt="" />
                <span>Account settings</span>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-4">
                <img src="/icons/header/language.svg" alt="" />
                <span>Language</span>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-4">
                <img src="/icons/header/legal.svg" alt="" />
                <span>Legal</span>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-4">
                <img src="/icons/header/logout.svg" alt="" />
                <span>Log out</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
