import React from "react";

const Footer = () => {
  return (
    <footer className="bg-purple-500 py-8 text-white">
      <div className="max-w-[1180px] mx-auto px-4 flex flex-col md:flex-row justify-between">
        {/* Logo and Description */}
        <div className="mb-6 md:mb-0 flex flex-col items-start md:items-start">
          <img
            src="/icons/footer/logo-white.svg"
            alt="MoovR Logo"
            className="w-24 mb-2"
          />
          <p className="text-sm">Move With Freedom</p>
          <p className="mt-4">Available on</p>
          <div className="flex space-x-3 mt-2">
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/icons/footer/playstore.svg"
                alt="Google Play"
                className="w-6 h-6"
              />
            </a>
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/icons/footer/appstore.svg"
                alt="App Store"
                className="w-6 h-6"
              />
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-sm w-full md:w-auto">
          <div>
            <h4 className="font-semibold mb-2">Company</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:underline">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Our Offering
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  News Room
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Investors
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Products</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:underline">
                  Ride
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Drive
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Deliver
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Rent
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Driver
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Planetary Citizenship</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:underline">
                  Safety
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Diversity and Inclusion
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Sustainability
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Travel</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:underline">
                  Reserve
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Cities
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
