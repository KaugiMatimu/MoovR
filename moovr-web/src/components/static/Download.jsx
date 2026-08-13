import React from "react";

const Download = () => {
  return (
    <section className="flex flex-col text-center md:text-start md:flex-row justify-between items-center gap-12 md:gap-2 bg-white px-8 py-16 md:py-24 space-y-8 md:space-y-0">
      {/* Left Section */}
      <div className="space-y-4 md:w-1/2">
        <h2 className="text-2xl font-semibold">Download MoovR App</h2>
        <p className="text-gray-600">Move With Freedom</p>

        <div className="flex items-start space-x-6 mt-6">
          {/* QR Code */}
          <div className="flex flex-col min-w-[80px]">
            <img
              src="/images/qr-code.png" // Replace with your QR code image path
              alt="QR Code"
              className="w-[80px] md:w-[160px] h-[80px] md:h-[160px] max-w-full"
            />
          </div>

          {/* Store Badges */}
          <div className="flex flex-col space-y-2 text-start md:space-y-4">
            <p className="text-gray-600 text-xs md:text-sm md:w-2/3">
              Scan to download the MoovR app for the best experience.
            </p>
            <p className="text-gray-800 font-semibold text-xs md:text-sm">
              Available on
            </p>
            <div className="flex space-x-2">
              <a href="#" target="_blank" rel="noopener noreferrer">
                <img
                  src="/icons/footer/playstore.svg" // Replace with your Play Store icon path
                  alt="Google Play"
                  className="h-5 md:h-8 w-auto"
                />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <img
                  src="/icons/footer/appstore-blue.svg" // Replace with your App Store icon path
                  alt="App Store"
                  className="h-5 md:h-8 w-auto"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 flex justify-center ">
        <img
          src="/images/phones.png" // Replace with your phone image path
          alt="MoovR App Preview"
          className="w-72 max-w-full"
        />
      </div>
    </section>
  );
};

export default Download;
