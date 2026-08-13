import React, { useState } from "react";

const RideOptions = ({ onSelectOption, selectedOption }) => {
  const options = [
    {
      name: "moovr x",
      time: "3 minutes",
      price: "₦ 7.80",
      image: "/images/car.png",
    },
    {
      name: "moovr mini",
      time: "4-5 minutes",
      price: "₦ 9.80",
      image: "/images/car.png",
    },
    {
      name: "moovr electric",
      time: "2-6 minutes",
      price: "₦ 7.80",
      image: "/images/car.png",
    },
  ];

  const handleSelectOption = (index) => {
    onSelectOption(options[index].name);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-80 mb-4">
      {options.map((option, index) => (
        <div
          key={index}
          onClick={() => handleSelectOption(index)}
          className={`flex items-center justify-between mb-3 p-3 rounded-[12px] cursor-pointer ${
            selectedOption === option.name ? "bg-lightPurple" : "bg-transparent"
          }`}
        >
          <img src={option.image} alt={option.name} className="w-auto h-12" />
          <div className="flex flex-col flex-grow ml-3">
            <span className="font-semibold">{option.name}</span>
            <span className="text-sm text-gray-500">{option.time}</span>
          </div>
          <span className="font-semibold">{option.price}</span>
        </div>
      ))}
    </div>
  );
};

export default RideOptions;
