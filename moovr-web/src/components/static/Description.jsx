import React from "react";

const Description = () => {
  return (
    <div className="flex flex-col text-center md:text-start md:flex-row items-center justify-between px-8 py-16 md:py-24">
      {/* Left Section - Image */}
      <div className="md:w-1/2">
        <img
          src="/images/description-img.png" // Replace with your image path
          alt="Carpool illustration"
          className="w-auto h-[300px] md:h-[400px] mx-auto"
        />
      </div>

      {/* Right Section - Text */}
      <div className="md:w-1/2 mt-8 md:mt-0  md:px-20 ">
        <div>
          <h2 className="text-2xl font-semibold mb-7">
            Ride Together, Thrive Together
          </h2>
          <p className="text-primaryGray/50 mb-12 md:w-3/4">
            Join our carpool community and enjoy a smarter, greener way to
            commute. Share rides, reduce costs, and make new friends while
            helping the environment. Together, we can make every journey more
            enjoyable and sustainable.
          </p>
          <a href="#" className="text-primaryGray font-medium hover:underline">
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
};

export default Description;
