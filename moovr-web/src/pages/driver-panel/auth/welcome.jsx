import { FiChevronRight, FiCheckCircle } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../../utils/BaseURL";
import { DotLoader } from "react-spinners";

export default function Welcome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BaseURL}/auth/get-user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(response.data.user);
        localStorage.setItem("userData", JSON.stringify(response.data.user));
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const isComplete = (stepKey) => {
    if (!userData) return false;
    switch (stepKey) {
      case "/d/setup-account":
        return !!userData.documents?.proofOfResidency;
      case "/d/setup-profile":
        return !!userData.profilePicture;
      case "/d/setup-license":
        return !!userData.documents?.drivingLicense;
      case "/d/vehicle/registration":
        return !!userData.documents?.vehicleRegistrationBook;
      case "/d/vehicle/insurance":
        return !!userData.documents?.vehicleInsurance;
      case "/d/terms":
        return !!userData.termsAccepted;
      default:
        return false;
    }
  };

  const allStepsCompleted = userData && 
    userData.profilePicture && 
    userData.documents?.proofOfResidency &&
    userData.documents?.drivingLicense && 
    userData.documents?.vehicleRegistrationBook &&
    userData.documents?.vehicleInsurance &&
    userData.termsAccepted;

  const steps = [
    {
      title: "CNIC Front side",
      key: "/d/setup-account",
    },
    {
      title: "Upload picture",
      key: "/d/setup-profile",
    },
    {
      title: "Driving license",
      key: "/d/setup-license",
    },
    {
      title: "Vehicle registration book",
      key: "/d/vehicle/registration",
    },
    {
      title: "Vehicle Insurance",
      key: "/d/vehicle/insurance",
    },
    {
      title: "Terms and conditions",
      subtitle: "Required final step",
      key: "/d/terms",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <DotLoader size={60} color="#4B6EEC" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[1180px]  bg-white shadow-md rounded-2xl p-8 py-24 relative overflow-hidden">
        {/* Top left curve */}
        <div className="absolute top-0 left-0 ">
          <img src="/driver/auth/welcome.svg" alt="" />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-[600px]">
          <h1 className="text-2xl font-semibold mb-2">
            Welcome Mr. {userData?.firstName} {userData?.lastName}
          </h1>
          <p className="text-gray-600 mb-8">
            Here's what you need to do to setup your account.
          </p>

          <div className="grid lg:grid-cols-2 gap-4">
            {steps.map((step) => {
              const completed = isComplete(step.key);
              return (
                <Link key={step.key} to={step.key}>
                  <button
                    className={`w-full p-4 rounded-lg text-left transition-colors flex items-center justify-between ${
                      completed ? "bg-green-50 hover:bg-green-100" : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div>
                      <h3 className={`font-medium ${completed ? "text-green-700" : ""}`}>
                        {step.title}
                      </h3>
                      {step.subtitle && (
                        <p className="text-sm text-gray-500">{step.subtitle}</p>
                      )}
                    </div>
                    {completed ? (
                      <FiCheckCircle className="text-green-500 text-xl" />
                    ) : (
                      <FiChevronRight className="text-gray-400" />
                    )}
                  </button>
                </Link>
              );
            })}
          </div>

          {allStepsCompleted && (
            <div className="mt-12 flex flex-col items-center">
              {userData.verificationStatus === "approved" ? (
                <button
                  onClick={() => navigate("/d/dashboard")}
                  className="w-full max-w-xs py-4 bg-purple-600 text-white rounded-full text-lg font-semibold hover:bg-purple-700 transition-all shadow-lg transform hover:scale-105"
                >
                  Go to Dashboard
                </button>
              ) : userData.verificationStatus === "rejected" ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center w-full max-w-md">
                  <p className="font-semibold text-lg mb-1">Account Rejected</p>
                  <p className="text-sm">Unfortunately, your application has been rejected. Please contact support for further information.</p>
                </div>
              ) : (
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-center w-full max-w-md shadow-sm">
                  <div className="flex justify-center mb-3">
                    <div className="animate-pulse bg-blue-200 p-2 rounded-full">
                      <FiCheckCircle className="text-blue-600 text-2xl" />
                    </div>
                  </div>
                  <p className="font-bold text-lg mb-1">Pending Approval</p>
                  <p className="text-sm opacity-90">Your profile is complete! Our team is currently reviewing your documents. You'll gain access to the dashboard once approved.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
