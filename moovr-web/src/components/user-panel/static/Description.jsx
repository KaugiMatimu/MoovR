import React from "react";
import { useLanguage } from "../../../context/LanguageContext.jsx";

const Description = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col text-center md:text-start md:flex-row items-center justify-between px-8 py-16 md:py-24">
      {/* Left Section - Image */}
      <div className="md:w-1/2">
        <img
          src="/images/description-img.png" // Replace with your image path
          alt={t("rideTogetherThriveTogether")}
          className="w-auto h-[300px] md:h-[400px] mx-auto"
        />
      </div>

      {/* Right Section - Text */}
      <div className="md:w-1/2 mt-8 md:mt-0  md:px-20 ">
        <div>
          <h2 className="text-2xl font-semibold mb-7">
            {t("rideTogetherThriveTogether")}
          </h2>
          <p className="text-primaryGray/50 mb-12 md:w-3/4">
            {t("carpoolCommunity")}
          </p>
          <a href="#" className="text-primaryGray font-medium hover:underline">
            {t("learnMore")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Description;
