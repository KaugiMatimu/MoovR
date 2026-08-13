import React from "react";

const Banner = () => {
  return (
    <div className="bg-darkPurple  text-white rounded-[20px] overflow-hidden grid md:grid-cols-2 mx-8 my-16 md:my-24">
      {/* Left Section */}
      <div className="p-8 ">
        <h2 className="text-[32px] font-[600] mb-4">Travel safe with us</h2>
        <p className="mb-6 text-[16px] leading-[19px] text-white/50 md:w-1/2">
          Your trusted car riding app ensuring safe, reliable, and comfortable
          journeys every time. Enjoy peace of mind with our top-notch safety
          features and professional drivers.
        </p>
        <button className="bg-primaryPurple mt-8 hover:bg-purple-600 text-white py-4 px-24 rounded-full font-medium">
          Ride
        </button>
      </div>

      {/* Right Section */}
      <div className="">
        <img
          src="/images/hero-banner.png" // Replace with the path to your image
          alt="Car on road"
          className="w-full h-full object-cover"
        />
        {/* <div className="absolute bottom-4 right-4">
          <img
            src="/images/logo.png" // Replace with the path to your logo image
            alt="MoovR Logo"
            className="w-20"
          />
        </div> */}
      </div>
    </div>
  );
};

export default Banner;
