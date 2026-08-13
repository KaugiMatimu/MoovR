import React from "react";
import { useLanguage } from "../../../context/LanguageContext.jsx";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-purple-500 py-8 text-white">
      <div className="max-w-[1180px] mx-auto px-4 flex flex-col md:flex-row justify-between">
        {/* Logo and Description */}
        <div className="mb-6 md:mb-0 flex flex-col items-start md:items-start">
          <img
            src="/icons/footer/logo-white.svg"
            alt="MoovR Logo"
            className="w-24 mb-2"
          />
          <p className="text-sm">{t("moveWithFreedom")}</p>
          <p className="mt-4">{t("availableOn")}</p>
          <div className="flex space-x-3 mt-2">
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/icons/footer/playstore.svg"
                alt="Google Play"
                className="w-6 h-6"
              />
            </a>
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/icons/footer/appstore.svg"
                alt="App Store"
                className="w-6 h-6"
              />
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-sm w-full md:w-auto">
          <div>
            <h4 className="font-semibold mb-2">{t("company")}</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:underline">
                  {t("about")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t("ourOffering")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t("newsRoom")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t("investors")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t("blog")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t("careers")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">{t("products")}</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:underline">
                  {t("ride")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t("driveWithoutDriving")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t("deliver")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t("rent")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t("driver")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">{t("planetaryCitizenship")}</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:underline">
                  {t("safety")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t("diversityAndInclusion")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t("sustainability")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">{t("travel")}</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:underline">
                  {t("reserve")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t("cities")}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
