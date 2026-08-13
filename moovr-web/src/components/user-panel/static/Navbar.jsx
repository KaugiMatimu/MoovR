import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext.jsx";

const Navbar = () => {
  const { t } = useLanguage();

  return (
    <nav className="flex max-w-[1280px] mx-auto justify-between items-center px-8 py-6  bg-white">
      {/* Logo */}
      <div>
        <img src="/images/logo.svg" alt="MoovR Logo" className="h-8" />
      </div>
      {/* Buttons */}
      <div className="space-x-4">
        <Link
          to="/choose"
          state={{ from: "login" }}
          className="text-gray-700 font-medium"
        >
          {t("logIn")}
        </Link>
        <Link
          to={"/choose"}
          state={{ from: "signup" }}
          className="bg-purple-500 text-white py-2 px-4 rounded-full hover:bg-purple-600"
        >
          {t("signUp")}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
