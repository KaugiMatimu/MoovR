// import React, { useState } from "react";

// const Name = () => {
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Handle submission logic here
//     console.log("First Name:", firstName);
//     console.log("Last Name:", lastName);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-8 text-center">
//         <img
//           src="/images/logo.svg"
//           alt="Logo"
//           className="mx-auto mb-6 w-20 h-20"
//         />
//         <h2 className="text-xl font-semibold mb-2">What's your name?</h2>
//         <p className="text-gray-500 mb-6">
//           Let us know how to properly address you.
//         </p>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="text"
//             placeholder="Enter your first name"
//             value={firstName}
//             onChange={(e) => setFirstName(e.target.value)}
//             className="w-full px-4 py-2 border rounded-full bg-gray-100 focus:outline-none"
//           />
//           <input
//             type="text"
//             placeholder="Enter your last name"
//             value={lastName}
//             onChange={(e) => setLastName(e.target.value)}
//             className="w-full px-4 py-2 border rounded-full bg-gray-100 focus:outline-none"
//           />
//           <button
//             type="submit"
//             className="w-full py-3 bg-purple-500 text-white rounded-full text-lg hover:bg-purple-600"
//           >
//             Done
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Name;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Name = ({ setUserData }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserData((prev) => ({ ...prev, firstName, lastName }));
    navigate("/earn");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">What's your name?</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <button type="submit" className="w-full py-3 bg-purple-500 text-white">
            Next
          </button>
        </form>
      </div>
    </div>
  );
};

export default Name;
