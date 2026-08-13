import React from "react";
import { Link } from "react-router-dom";

const ThankYouCard = ({link}) => {
  return (
    <div className=" bg-white rounded-2xl shadow-lg p-8 w-96 text-center">
      <div className="flex justify-center mb-6">
        <div className="flex items-center justify-center">
          <img src="/images/thank-you.png" alt="Checkmark" />
        </div>
      </div>
      <h2 className="font-semibold text-gray-800 ">Thank You</h2>
      <h2 className="font-semibold text-gray-800 mb-4">For Choosing MoovR</h2>
      <Link
        to={link}
        className="bg-purple-500 text-white py-3 px-20 w-full rounded-full text-lg font-semibold hover:bg-purple-600"
      >
        Go Back
      </Link>
    </div>
  );
};

export default ThankYouCard;
