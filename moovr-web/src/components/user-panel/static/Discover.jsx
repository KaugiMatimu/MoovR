import React from "react";
import { useLanguage } from "../../../context/LanguageContext.jsx";

const Discover = () => {
  const { t } = useLanguage();
  const discoverCards = [
    {
      image: "/images/discover-img-1.jpeg",
      title: t("yourRideYourWay"),
      description: t("reservationsLife"),
      link: t("learnMore"),
    },
    {
      image: "/images/discover-img-2.png",
      title: t("rentCarAdventure"),
      description: t("rentCarDescription"),
      link: t("learnMore"),
    },
    {
      image: "/images/discover-img-3.png",
      title: t("driveWithoutDriving"),
      description: t("driveWithoutDrivingDescription"),
      link: t("learnMore"),
    },
  ];

  return (
    <div className="px-8 py-10">
      <h2 className="text-xl font-semibold mb-6">Discover</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {discoverCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-gray-600 mb-4">{card.description}</p>
              <a
                href="#"
                className="text-purple-500 font-semibold hover:underline"
              >
                {card.link}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discover;
