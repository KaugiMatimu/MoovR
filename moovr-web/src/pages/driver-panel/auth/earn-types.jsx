import { Link } from "react-router-dom";

export default function EarnTypes() {
  const options = [
    {
      title: "Drive",
      description: "You want to drive four door vehicle on MoovR platform.",
    },
    {
      title: "Rental",
      description: "You want to provide rental services on MoovR platform.",
    },
    {
      title: "Deliver",
      description: "You want to be a delivery guy on MoovR platform.",
    },
    {
      title: "Driver",
      description: "You want to be a driver on MoovR platform.",
    },
  ];

  const handleOptionClick = (option) => {
    // Retrieve existing userData from localStorage
    const userData = JSON.parse(localStorage.getItem("userData")) || {};

    // Update userData with the selected option
    userData.serviceType = option.title;

    // Save updated userData back to localStorage
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[1180px] bg-white rounded-2xl shadow-md p-8 py-24 relative overflow-hidden">
        {/* Top left curve */}
        <div className="absolute top-0 left-0 ">
          <img src="/driver/auth/welcome.svg" alt="" />
        </div>

        {/* Bottom right curve */}
        <div className="hidden lg:block absolute bottom-0 right-0 h-full">
          <img
            src="/driver/driver-bg-img-1.svg"
            alt=""
            className="h-full w-full object-contain transform rotate-180"
          />
        </div>

        {/* Content */}
        <div className="relative max-w-[600px] mx-auto">
          <h1 className="text-2xl font-semibold mb-8">
            Choose how would you like to earn with MoovR
          </h1>

          <div className="grid grid-cols-2 gap-4">
            {options.map((option) => (
              <Link
                to={"/d/vehicle-types"}
                key={option.title}
                onClick={() => handleOptionClick(option)}
              >
                <button className="p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors">
                  <h3 className="font-medium mb-2">{option.title}</h3>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
