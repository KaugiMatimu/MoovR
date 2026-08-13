import React from "react";

const AccountDetailsModal = ({ setIsModalOpen }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white  p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-center font-semibold text-xl mb-4">
          Account details
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="">Name</label>
            <input
              type="text"
              placeholder="Name"
              className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="">Email</label>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="">Phone No.</label>
            <input
              type="number"
              placeholder="Phone No."
              className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <button
            className="w-[90%]  mt-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700"
            onClick={() => setIsModalOpen(false)}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsModal;
