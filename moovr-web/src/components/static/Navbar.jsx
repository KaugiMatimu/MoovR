import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-6 shadow-md bg-white">
      {/* Logo */}
      <div>
        <img src="/images/logo.svg" alt="MoovR Logo" className="h-8" />
      </div>
      {/* Links */}
      {/* <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
        <a href="#" className="hover:text-purple-500">
          Home
        </a>
        <a href="#" className="hover:text-purple-500">
          Drive
        </a>
        <a href="#" className="hover:text-purple-500">
          Rent
        </a>
        <a href="#" className="hover:text-purple-500">
          Business
        </a>
        <a href="#" className="hover:text-purple-500">
          About
        </a>
      </div> */}
      {/* Buttons */}
      <div className="space-x-4">
        <Link to={"/login"} className="text-gray-700 font-medium">
          Log In
        </Link>
        <Link
          to={"/signup"}
          className="bg-purple-500 text-white py-2 px-4 rounded-full hover:bg-purple-600"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
