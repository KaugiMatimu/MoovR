import React from "react";
import Header from "../../../components/user-panel/header"; // Import your pre-built header component
import { BiArrowBack } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext.jsx";

const languages = [
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    icon: "/icons/languages/arabic.png",
  },
  { code: "ur", name: "Urdu", nativeName: "اردو", icon: "/icons/languages/urdu.png" },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    icon: "/icons/languages/english.png",
  },
];

const Languages = () => {
  const navigate = useNavigate();
  const { locale, setLocale, t, languageName } = useLanguage();

  return (
    <div className="text-start text-gray-700">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex gap-3 items-center mb-8 cursor-pointer py-2 px-3 rounded-[12px] w-fit hover:bg-gray-100"
        >
          <BiArrowBack size={23} /> {t("back")}
        </button>

        <div className="mb-8 text-xl font-semibold text-gray-900">{t("chooseLanguage")}</div>

        <div className="w-full md:w-2/3 grid md:grid-cols-2 gap-6 justify-around items-center py-4 bg-white">
          {languages.map((lang) => {
            const isActive = lang.code === locale;
            return (
              <button
                key={lang.code}
                onClick={() => setLocale(lang.code)}
                className={`flex justify-between items-center space-x-2 shadow-md border rounded-lg text-sm px-5 py-4 text-left transition ${
                  isActive
                    ? "border-purple-600 bg-purple-50 text-purple-900"
                    : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex gap-3 items-center">
                  <img src={lang.icon} className="h-8 w-8" />
                  <div>
                    <span className="text-lg font-medium">{lang.name}</span>
                    <div className="text-sm text-gray-500">{lang.nativeName}</div>
                  </div>
                </div>
                {isActive && <span className="text-sm font-semibold text-purple-700">✓</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>{t("language")}: {languageName}</p>
          <p>{t("currentLanguage")}</p>
        </div>
      </div>
    </div>
  );
};

export default Languages;
