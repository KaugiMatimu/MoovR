import { useState, useEffect } from "react";
import Header from "../../../components/user-panel/header";
import { BiArrowBack } from "react-icons/bi";
import { FaChevronDown } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BaseURL } from "../../../utils/BaseURL";

const paymentOptions = ["Cash", "MoovR Wallet", "Paystack", "Debit Card", "Credit Card", "Google Pay"];

const CarDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the car ID from the URL parameters
  const [carDetails, setCarDetails] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("Cash");

  const isCarAvailable = () => {
    if (!carDetails) return true;
    if (typeof carDetails.isAvailable === "boolean") return carDetails.isAvailable;

    const hasActiveRental = (carDetails.rentalPeriods || []).some((period) =>
      ["pending", "approved"].includes(period.status)
    );

    return !hasActiveRental;
  };

  // Fetch car details using the ID from the API
  useEffect(() => {
    const fetchCarDetails = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${BaseURL}/cars/list/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (data && data.carListing) {
          setCarDetails(data.carListing);
        }
      } catch (error) {
        console.error("Error fetching car details:", error);
      }
    };

    if (id) {
      fetchCarDetails();
    }
  }, [id]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelectPayment = (paymentMethod) => {
    const nextPayment = paymentMethod || "Cash";
    //console.log("Selected payment:", nextPayment);
    //console.log("Current selectedPayment state:", selectedPayment);
    setSelectedPayment(nextPayment);
    setIsDropdownOpen(false);
  };

  if (!carDetails) {
    return <div>Loading...</div>; // Display loading state while fetching car details
  }

  return (
    <div className="h-screen w-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="max-w-[1180px] mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex gap-3 items-center mb-8 cursor-pointer py-2 px-3 rounded-[12px] w-fit hover:bg-gray-100"
        >
          <BiArrowBack size={23} /> Back
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{carDetails.vehicleName}</h1>
          <p className="text-gray-500 mt-2">{carDetails.description}</p>
        </div>

        {/* Car Image Section */}
        <div className="flex justify-center mb-12">
          <div className="relative w-[600px]">
            {/* Dynamically fetch the car image */}
            <img
              src={carDetails.image || "/images/BMW.png"} // Fallback if imageUrl is not available
              alt="Car"
              className="w-[85%] h-auto object-contain"
            />
            <div className="absolute w-full bottom-[10px] left-1/2 transform -translate-x-1/2">
              <img src="/images/car-surface.svg" alt="" />
            </div>
          </div>
        </div>

        {/* Rental Price Section */}
        <div className="bg-white rounded-2xl border-[1.4px] border-gray-200 shadow-md p-6 flex justify-between items-center relative">

          
          <div className="relative w-1/3">
            <div
              className="px-4 py-3 space-y-4 bg-white cursor-pointer"
              onClick={toggleDropdown}
            >
              <div className="flex justify-between">
                <h3 className="text-[16px] text-primaryGray">Rental Price</h3>
                <span className="flex items-end gap-[.5px]">
                  <p className="text-[13px] text-primaryGray mb-1 font-bold">
                    ₦
                  </p>
                  <p className="text-[20px] text-primaryGray font-bold">
                    {carDetails.price}
                  </p>
                  <p className="text-[10px] text-primaryGray/50 mb-1">/hour</p>
                </span>
              </div>
            </div>
          </div>

          {/* Dropdown for payment selection */}
          <div className="relative">
            <button
              onClick={() => {
                //console.log("Toggle dropdown, current payment:", selectedPayment);
                toggleDropdown();
              }}
              className="px-4 py-2 bg-gray-100 text-sm rounded-full flex items-center gap-2"
            >
              <span key={selectedPayment}>{selectedPayment}</span> <FaChevronDown />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-12 right-0 bg-white shadow-md rounded-md border border-gray-200 z-10 min-w-[180px]">
                {["Cash", "MoovR Wallet", "Paystack", "Debit Card", "Credit Card", "Google Pay"].map(
                  (paymentMethod) => (
                    <button
                      key={paymentMethod}
                      onClick={() => {
                        //console.log("Clicking payment method:", paymentMethod);
                        handleSelectPayment(paymentMethod);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {paymentMethod}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {!isCarAvailable() && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            This car is currently hired and cannot be rented again until it has been returned.
          </div>
        )}

        {/* Rent a Car Button */}
        <button
          type="button"
          disabled={!isCarAvailable()}
          onClick={() =>
            navigate(`/rent/car/confirm/${id}`, {
              state: { paymentMethod: selectedPayment, car: carDetails },
            })
          }
          className={`flex justify-center py-3 px-12 rounded-full w-1/3 text-lg font-medium mt-6 ${
            isCarAvailable()
              ? "bg-purple-500 text-white hover:bg-purple-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isCarAvailable() ? "Rent a Car" : "Hired"}
        </button>
      </div>
    </div>
  );
};

export default CarDetail;
