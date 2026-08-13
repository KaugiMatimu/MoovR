import React from "react";

const ThankYouCard = () => {
  return (
    <div className=" bg-white rounded-2xl shadow-lg p-8 w-96 text-center">
      <div className="flex justify-center mb-6">
        <div className="flex items-center justify-center">
          <img src="/images/thank-you.png" alt="Checkmark" />
        </div>
      </div>
      <h2 className="font-semibold text-gray-800 ">Thank You</h2>
      <h2 className="font-semibold text-gray-800 mb-4">For Choosing MoovR</h2>
      <button className="bg-purple-500 text-white py-3 w-full rounded-full text-lg font-semibold hover:bg-purple-600">
        Go Back
      </button>
    </div>
  );
};

export default ThankYouCard;
