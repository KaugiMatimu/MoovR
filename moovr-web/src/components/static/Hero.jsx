import React from "react";

const HeroSection = () => {
  return (
    <div className="grid md:grid-cols-2 gap-12 justify-between items-center px-8 py-16 md:py-24 bg-gray-50">
      {/* Left Side - Text & Form */}
      <div className=" space-y-6 ">
        <h1 className="text-4xl font-bold text-gray-900">
          Ride Smart, Arrive Happy <br /> With MoovR
        </h1>
        <p className="text-gray-500">
          Add your journey details, hop in, and go.
        </p>
        {/* Input Fields */}
        <div className="relative space-y-4 max-w-xs">
          {/* Input Fields */}
          <input
            type="text"
            placeholder="Enter pick-up location"
            className="relative w-full px-4 py-3 bg-gray-100 rounded-full border border-gray-300 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Enter destination"
            className="relative w-full px-4 py-3 bg-gray-100 rounded-full border border-gray-300 focus:outline-none"
          />
        </div>

        {/* CTA Button */}
        <button className="bg-purple-500 text-white py-3 px-14 rounded-full font-medium hover:bg-purple-600">
          See prices
        </button>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:block">
        <img
          src="/images/hero-section-img.png"
          alt="Woman with luggage"
          className="w-full max-w-lg"
        />
      </div>
    </div>
  );
};

export default HeroSection;
