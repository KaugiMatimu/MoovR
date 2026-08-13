import React from "react";
import Header from "../../../components/driver-panel/header"; // Import your pre-built header component
import { BiArrowBack } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";

const languages = [
  {
    name: "Arabic",
    nativeName: "العربية",
    icon: "/icons/languages/arabic.png",
  },
  { name: "Urdu", nativeName: "اردو", icon: "/icons/languages/urdu.png" },
  {
    name: "English",
    nativeName: "English",
    icon: "/icons/languages/english.png",
  },
];

const DriverLanguages = () => {
  const navigate = useNavigate();

  return (
    <div className=" text-start text-gray-700">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex gap-3 items-center mb-8 cursor-pointer py-2 px-3 rounded-[12px] w-fit hover:bg-gray-100"
        >
          <BiArrowBack size={23} /> Back
        </button>
        <div className="w-2/3 grid md:grid-cols-2 gap-6 justify-around items-center py-4 bg-white">
          {languages.map((lang, index) => (
            <button
              key={index}
              className="flex justify-between items-center space-x-2  shadow-md border border-gray-200 text-gray-900 font-medium rounded-lg text-sm px-5 py-4 text-center "
            >
              <div className="flex gap-3 items-center">
                <img src={lang.icon} className="h-8 w-8" />
                <span className="text-lg">{lang.name}</span>
              </div>
              <span className="text-gray-400">{lang.nativeName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverLanguages;
