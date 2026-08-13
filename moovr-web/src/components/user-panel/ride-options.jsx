import React, { useState } from "react";
import { useLocation } from "react-router-dom";

const RATES = {
  Lagos: {
    baseFare: 500,
    perMinRate: 30,
    perKmRate: 200,
    minFare: 700,
  },
  Abuja: {
    baseFare: 500,
    perMinRate: 30,
    perKmRate: 200,
    minFare: 700,
  },
  "Port Harcourt": {
    baseFare: 500,
    perMinRate: 32,
    perKmRate: 210,
    minFare: 700,
  },
  Ibadan: {
    baseFare: 450,
    perMinRate: 25,
    perKmRate: 180,
    minFare: 700,
  },
  Akure: {
    baseFare: 400,
    perMinRate: 25,
    perKmRate: 180,
    minFare: 1000,
  },
  default: {
    baseFare: 400,
    perMinRate: 25,
    perKmRate: 180,
    minFare: 700,
  },
};

const RideOptions = ({ onSelect }) => {
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState(0);
  const rideData = location.state?.rideData;

  const calculateDynamicFare = (city, distance, estimatedTime = 0) => {
    const rates = RATES[city] || RATES.default;
    const distanceFare = distance * rates.perKmRate;
    const timeFare = estimatedTime * rates.perMinRate;
    const totalFare = rates.baseFare + distanceFare + timeFare;
    return Math.max(totalFare, rates.minFare).toFixed(2);
  };

  const detectCity = (pickupLocation) => {
    if (!pickupLocation) return "Lagos";
    const cities = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Akure"];
    for (const c of cities) {
      if (pickupLocation.toLowerCase().includes(c.toLowerCase())) {
        return c;
      }
    }
    return "Lagos";
  };

  const city = detectCity(rideData?.pickupLocation);
  const distance = rideData?.distance || 0;
  const fare = calculateDynamicFare(city, distance);

  const options = [
    {
      name: "MoovR X",
      type: "moovr x",
      time: "3 minutes",
      price: `₦ ${fare}`,
      image: "/images/car.png",
    },
    {
      name: "Comfort",
      type: "moovr mini",
      time: "4-5 minutes",
      price: `₦ ${(fare * 1.2).toFixed(2)}`,
      image: "/images/car.png",
    },
    {
      name: "Green",
      type: "moovr electric",
      time: "2-6 minutes",
      price: `₦ ${fare}`,
      image: "/images/car.png",
    },
  ];

  // Set default selection on mount
  React.useEffect(() => {
    if (onSelect) {
      onSelect(options[0].type);
    }
  }, []);

  const handleSelectOption = (index) => {
    setSelectedOption(index);
    if (onSelect) {
      onSelect(options[index].type);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-80 mb-4">
      {options.map((option, index) => (
        <div
          key={index}
          onClick={() => handleSelectOption(index)}
          className={`flex items-center justify-between mb-3 p-3 rounded-[12px] cursor-pointer ${
            selectedOption === index ? "bg-lightPurple" : "bg-transparent"
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
