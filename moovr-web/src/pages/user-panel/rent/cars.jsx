import { useState, useEffect } from "react";
import Header from "../../../components/user-panel/header"; // Import your Header component
import { BiArrowBack } from "react-icons/bi";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Link  , useNavigate } from "react-router-dom";
import { BaseURL } from "../../../utils/BaseURL";
import { DotLoader } from "react-spinners";
import toast from "react-hot-toast";


const RentCars = () => {
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("All");
  const [priceValue, setPriceValue] = useState("");
  const [cars, setCars] = useState([]); // State to store fetched cars
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State to handle error state

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  // Function to fetch cars from the API with token
  const fetchCars = async () => {
    const token = localStorage.getItem("token");
    console.log("your token is :",token);

    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BaseURL}/cars/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      setCars(data.carListings || []);
    } catch (error) {
      console.error("Fetch cars error:", error);
      setError(error.message);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // change the route through onclick 
  const changeRoute = ()=>{
    navigate('/ride')
  }

  return (
    <div className="h-full w-full">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="max-w-[1180px] mx-auto p-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center mb-4 hover:bg-gray-100 cursor-pointer py-2 px-3 rounded-[12px] w-fit">
            <button onClick={changeRoute}>
              <BiArrowBack size={23} />
            </button>

            {/* <h1 className="text-lg font-semibold"></h1> */}
          </div>
          <div className="relative">
            {/* Dropdown Button */}
            <button
              onClick={toggleDropdown}
              className="flex items-center justify-between px-4 py-2 bg-purple-100 text-purple-500 rounded-full shadow-sm"
            >
              {selectedOption}
              {isDropdownOpen ? (
                <FaChevronUp className="ml-2" />
              ) : (
                <FaChevronDown className="ml-2" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-12 right-0 w-56 bg-white shadow-lg rounded-lg mt-1 p-2">
                <ul className="flex flex-col">
                  <li
                    onClick={() => handleOptionSelect("All")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    All
                  </li>
                  <li
                    onClick={() => handleOptionSelect("Available")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Available
                  </li>
                  <li className="px-4 py-2 flex justify-between items-center gap-4">
                    <label>Price</label>
                    <input
                      type="text"
                      value={priceValue}
                      onChange={(e) => setPriceValue(e.target.value)}
                      placeholder="Price"
                      className="w-2/3 mt-1 px-2 py-1 bg-gray-100 rounded text-gray-500 focus:outline-none"
                    />
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Loading and Error Handling */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <DotLoader color="#A75AF2" />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 justify-center">
            {cars.length === 0 && <p>No cars available</p>}
            {cars
              .filter((car) => {
                if (selectedOption === "All") return true;
                if (selectedOption === "Available") return car.isAvailable;
                return true;
              })
              .map((car) => {
                const isAvailable = Boolean(car.isAvailable);
                const availabilityLabel = isAvailable ? "Available" : "Hired";
                const availabilityClass = isAvailable
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-amber-100 text-amber-700 border-amber-200";

                return (
                  <Link to={`/rent/car/details/${car._id}`} key={car._id}>
                    <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col cursor-pointer relative">
                      <div className="flex justify-end mb-2">
                        <span className={`border rounded-full px-2 py-1 text-xs font-semibold ${availabilityClass}`}>
                          {availabilityLabel}
                        </span>
                      </div>
                      <img
                        src={car.image || "/images/default-car.png"}
                        alt={car.vehicleName}
                        className="w-full h-40 object-cover mb-4"
                      />
                      <h2 className="font-semibold text-lg text-gray-800">
                        {car.vehicleName}
                      </h2>
                      <div className="flex gap-2 pt-3 items-center">
                        <img src="/icons/ride/map-pin.svg" alt="Location icon" />
                        <p className="text-sm text-gray-500">{car.location}</p>
                      </div>
                      <div className="flex items-center justify-between w-full mt-2">
                        <div className="flex gap-2 items-center">
                          <img src="/icons/ride/seats.svg" alt="Seats icon" />
                          <p className="text-gray-700">{car.seats} seats</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <img src="/icons/ride/coins.svg" alt="Price icon" />
                          <p className="font-medium text-gray-900">
                            ₦{car.price}/h
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentCars;
