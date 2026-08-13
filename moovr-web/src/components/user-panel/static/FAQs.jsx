import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useLanguage } from "../../../context/LanguageContext.jsx";

const FAQs = () => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      questionKey: "lostItemQuestion",
      answerKey: "lostItemAnswer",
    },
    {
      questionKey: "rentCarQuestion",
      answerKey: "rentCarAnswer",
    },
    {
      questionKey: "multiStopQuestion",
      answerKey: "multiStopAnswer",
    },
  ];

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="px-8 py-16 md:py-24">
      <h2 className="text-2xl font-semibold mb-6">
        {t("frequentlyAskedQuestions")}
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="rounded-lg overflow-hidden">
            <div
              className={`p-4 bg-purple-100 cursor-pointer flex justify-between items-center transition-all duration-300 ${
                activeIndex === index ? "bg-purple-200" : ""
              }`}
              onClick={() => handleToggle(index)}
            >
              <span className="text-gray-800">{t(faq.questionKey)}</span>
              {activeIndex === index ? (
                <FaChevronUp className="text-gray-500 transition-transform transform rotate-180" />
              ) : (
                <FaChevronDown className="text-gray-500 transition-transform transform rotate-0" />
              )}
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                activeIndex === index
                  ? "max-h-[200px] p-4 bg-white text-gray-700 border-t border-gray-200"
                  : "max-h-0"
              }`}
              style={{ maxHeight: activeIndex === index ? "200px" : "0" }}
            >
              <p
                className={`${
                  activeIndex === index ? "opacity-100" : "opacity-0"
                } transition-opacity duration-300`}
              >
                {t(faq.answerKey)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQs;
