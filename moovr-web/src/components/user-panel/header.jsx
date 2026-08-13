import axios from "axios";
import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaBars, FaTimes, FaUserCircle, FaChevronLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { BaseURL } from "../../utils/BaseURL";
import NotificationBadge from "../NotificationBadge";
import { useLanguage } from "../../context/LanguageContext.jsx";

const Header = ({ disableNavigation = false, showBackButton = false }) => {
  const navigate = useNavigate();
  const { t, locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNav, setSelectedNav] = useState("ride");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null); // User state to hold fetched data

  const navItems = [
    { key: "ride", label: t("ride"), link: "/ride" },
    { key: "rent", label: t("rent"), link: "/rent/cars" },
    { key: "driver", label: t("driver"), link: "/drivers" },
    { key: "package", label: t("package"), link: "/package" },
    { key: "intercityRide", label: t("intercityRide"), link: "/reserve" },
    { key: "bill", label: t("bill"), link: "/bill" },
  ];

  useEffect(() => {
    setSelectedNav("ride");
  }, [locale]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = (navItemKey) => {
    setSelectedNav(navItemKey);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token"); // Get token from localStorage
      try {
        const response = await axios.get(`${BaseURL}/auth/get-user`, {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in headers
          },
        });

        setUser(response.data.user); // Set user data from the API
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, []); // Empty dependency array means this runs once on component mount

  if (disableNavigation) {
    return (
      <header className="flex items-center justify-between px-8 pb-5 pt-8 z-50 shadow-md bg-white">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 font-semibold"
            >
              <FaChevronLeft /> {t("back")}
            </button>
          )}
          <img src="/images/logo.svg" alt="Logo" className="h-[40px] w-auto" />
        </div>
        <div className="text-sm font-medium text-gray-500">{t("rideInProgress")}</div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-8 pb-5 pt-8 z-50 shadow-md bg-white">
      {/* Left Section - Logo */}
      <div className="flex items-center space-x-6">
        <img
          src="/images/logo.svg"
          alt="Logo"
          className="h-[40px] w-auto pr-8"
        />

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-9">
          {navItems.map((navItem) => (
            <Link
              key={navItem.key}
              to={navItem.link}
              onClick={() => handleNavClick(navItem.key)}
              className={`flex flex-col items-center justify-center ${
                selectedNav === navItem.key ? "text-gray-700" : "text-gray-700"
              }`}
            >
              <img
                src={`/icons/header/${navItem.key}.svg`}
                alt={navItem.label}
                className="w-5 h-5"
              />
              <span>{navItem.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="relative">
        {/* Profile Button */}
        <div className="flex items-center justify-center gap-3 md:gap-4">
          <NotificationBadge />
          <Link to={"/wallet"}>
            <img src="/icons/header/wallet.svg" alt="" />
          </Link>
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-2 cursor-pointer"
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={t("user")}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <FaUserCircle className="w-10 h-10 text-gray-400" />
            )}
            <div className="hidden md:flex items-center gap-2">
              <span className=" text-gray-700">
                {" "}
                {user?.firstName || user?.lastName || t("user")}
              </span>
              {isOpen ? (
                <FaChevronUp className="ml-1" />
              ) : (
                <FaChevronDown className="ml-1" />
              )}
            </div>
          </button>
          {/* Mobile Hamburger Menu */}
          <button
            onClick={toggleSidebar}
            className="md:hidden flex items-center space-x-2 text-gray-700"
          >
            <FaBars size={24} />
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
                    alt={t("user")}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <FaUserCircle className="w-8 h-8 text-gray-400" />
                )}
                <span className=" text-gray-700">
                  {" "}
                  {user?.firstName || user?.lastName || t("user")}
                </span>
              </div>
              <Link to={"/activity"}>
                <img src="/icons/header/pad.svg" alt="" />
              </Link>
            </div>
            <ul className="py-2">
              <Link
                to={"/settings"}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-4"
              >
                <img src="/icons/header/account.svg" alt="" />
                <span>{t("accountSettings")}</span>
              </Link>
              <Link
                to={"/languages"}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-4"
              >
                <img src="/icons/header/language.svg" alt="" />
                <span>{t("language")}</span>
              </Link>
              <Link
                to={"/privacy-policy"}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-4"
              >
                <img src="/icons/header/legal.svg" alt="" />
                <span>{t("legal")}</span>
              </Link>
              <Link
                to={"/"}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-4"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("userData");
                }}
              >
                <img src="/icons/header/logout.svg" alt="" />
                <span>{t("logout")}</span>
              </Link>
            </ul>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>
      <div
        className={`fixed right-0 top-0 w-64 z-[1000] bg-white h-full shadow-lg transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end items-center pr-8 py-10">
          <button onClick={toggleSidebar}>
            <FaTimes size={24} />
          </button>
        </div>

        <nav className="space-y-6 px-4 py-8">
          {navItems.map((navItem) => (
            <Link
              key={navItem.key}
              to={navItem.link}
              onClick={() => handleNavClick(navItem.key)}
              className={`flex items-center space-x-4 px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                selectedNav === navItem.key ? "bg-gray-100" : ""
              }`}
            >
              <img
                src={`/icons/header/${navItem.key}.svg`}
                alt={navItem.label}
                className="w-5 h-5"
              />
              <span>{navItem.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
