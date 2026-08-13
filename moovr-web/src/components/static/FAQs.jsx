import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "Can I have a lost item delivered to me?",
      answer:
        "Yes, MoovR offers a lost item delivery service. You can contact customer support or the driver to arrange for the return of your item.",
    },
    {
      question: "Can I rent a car using MoovR?",
      answer:
        "Absolutely! MoovR provides a car rental option for your convenience. Just navigate to the Rent section, choose a vehicle, and complete the booking process.",
    },
    {
      question:
        "Can I request a ride that picks up friends in different locations?",
      answer:
        "Yes, with MoovR, you can add multiple stops to your trip to pick up friends from different locations. Simply add the additional stops when booking your ride.",
    },
  ];

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="px-8 py-16 md:py-24">
      <h2 className="text-2xl font-semibold mb-6">
        Frequently Asked Questions
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
              <span className="text-gray-800">{faq.question}</span>
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
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQs;
