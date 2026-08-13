// import React, { useState, useEffect } from "react";

// const Verification = () => {
//   const [code, setCode] = useState(["", "", "", ""]);
//   const [resendTimer, setResendTimer] = useState(57);

//   // Handle input changes for each digit
//   const handleChange = (e, index) => {
//     const newCode = [...code];
//     newCode[index] = e.target.value.slice(0, 1); // Ensure only one character
//     setCode(newCode);

//     // Focus the next input automatically
//     if (e.target.value && index < 3) {
//       document.getElementById(`digit-${index + 1}`).focus();
//     }
//   };

//   // Resend timer countdown
//   useEffect(() => {
//     if (resendTimer > 0) {
//       const timer = setInterval(() => setResendTimer(resendTimer - 1), 1000);
//       return () => clearInterval(timer);
//     }
//   }, [resendTimer]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const verificationCode = code.join("");
//     // Handle verification logic here
//     console.log("Verification Code:", verificationCode);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-8 text-center">
//         <img
//           src="/images/logo.svg"
//           alt="Logo"
//           className="mx-auto mb-6 w-20 h-20"
//         />
//         <h2 className="text-lg font-semibold mb-4">
//           Enter the 4 digit code sent to you at +2345-xxxxxxx
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="flex justify-center space-x-4">
//             {code.map((digit, index) => (
//               <input
//                 key={index}
//                 type="text"
//                 id={`digit-${index}`}
//                 value={digit}
//                 onChange={(e) => handleChange(e, index)}
//                 className="w-16 h-16 text-center text-2xl border rounded-lg focus:outline-none focus:border-purple-500"
//                 maxLength="1"
//               />
//             ))}
//           </div>
//           <div className="text-sm text-gray-500">
//             Resend code{" "}
//             {resendTimer > 0 ? (
//               <span className="text-gray-700">{`0:${
//                 resendTimer < 10 ? `0${resendTimer}` : resendTimer
//               }`}</span>
//             ) : (
//               <button
//                 type="button"
//                 className="text-purple-500"
//                 onClick={() => setResendTimer(57)}
//               >
//                 Resend
//               </button>
//             )}
//           </div>
//           <button
//             type="submit"
//             className="w-full py-3 bg-purple-500 text-white rounded-full text-lg hover:bg-purple-600"
//           >
//             Verify
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Verification;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Verification = ({ setUserData }) => {
  const [code, setCode] = useState(["", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(57);
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleChange = (e, index) => {
    const newCode = [...code];
    newCode[index] = e.target.value.slice(0, 1);
    setCode(newCode);

    if (e.target.value && index < 3) {
      document.getElementById(`digit-${index + 1}`).focus();
    }
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    if (verificationCode === "1234") {
      setUserData((prev) => ({ ...prev, phone }));
      navigate("/name");
    } else {
      alert("Invalid Code");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-8 text-center">
        <h2 className="text-lg font-semibold mb-4">
          Enter your phone number and the 4-digit code sent to you.
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
          />
          <div className="flex justify-center space-x-4">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                id={`digit-${index}`}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                className="w-12 h-12 text-center border rounded-lg"
              />
            ))}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-purple-500 text-white rounded-full"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default Verification;
