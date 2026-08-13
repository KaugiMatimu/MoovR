import { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronDown } from "react-icons/fi";
import Header from "../../components/driver-panel/header";
import { BaseURL } from "../../utils/BaseURL";
import toast from "react-hot-toast";

export default function Bookings() {
  const [filter, setFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatTime = (date) => {
    const utcHours = new Date(date).getUTCHours();
    const utcMinutes = new Date(date).getUTCMinutes();
    const hours = utcHours % 12 || 12;
    const minutes = utcMinutes.toString().padStart(2, "0");
    const ampm = utcHours >= 12 ? "PM" : "AM";
    return `${hours}:${minutes} ${ampm}`;
  };

 const parseStoredUser = () => {
   const rawUser = localStorage.getItem("user") || localStorage.getItem("userData");
   if (!rawUser || rawUser === "undefined" || rawUser === "null") return null;
   try {
     return JSON.parse(rawUser);
   } catch (error) {
     console.warn("Failed to parse stored user data", rawUser, error);
     return null;
   }
 };

 useEffect(() => {
  const driverData = parseStoredUser();
  const token = localStorage.getItem("token");
  const driverId = driverData ? driverData._id || driverData.id : null;
  console.log("Your driver ID is:", driverId);

  if (driverId) {
    axios
      .get(`${BaseURL}/bookings/driver-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Response from API:", response.data);

        const bookings = Array.isArray(response.data.bookings)
          ? response.data.bookings
          : [];

        setBookings(bookings);

        if (bookings.length <= 0) {
          toast.error("You do not have any bookings yet");
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to fetch bookings");
        setLoading(false);
      });
  } else {
    toast.error("Driver ID not found");
    setLoading(false);
  }
}, []);


  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-[#8257E9] bg-opacity-20 text-[#8257E9]";
      case "Completed":
        return "bg-[#8257E9] text-white";
      case "Cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const getActionButton = (status) => {
    return (
      <button
        disabled
        className={`px-6 py-4 ${
          status === "Inactive"
            ? "bg-[#F3E9FE] text-primaryPurple"
            : "bg-[#a38ade] text-white"
        } font-bold rounded-full cursor-not-allowed transition-colors`}
      >
        Cancel
      </button>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-medium">Bookings</h1>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-4 py-2 bg-[#8257E9] bg-opacity-10 rounded-full text-sm flex items-center gap-2"
            >
              {filter}
              <FiChevronDown
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                {["All", "Active", "Completed", "Cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilter(status);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-9">
          {bookings
            .filter((booking) => filter === "All" || booking.status === filter)
            .map((booking) => (
              <div
                key={booking._id}
                className="bg-white border border-gray-300 shadow-md rounded-lg p-6 flex items-center justify-between"
              >
                <div className="grid grid-cols-2 items-center gap-6">
                  <div className="relative h-[250px] w-[250px] flex items-center">
                    <img
                      src={booking.image || "/images/BMW.png"}
                      alt={booking.carName}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                    <span
                      className={`px-3 py-1 absolute top-0 left-0 rounded-full text-sm font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-[600] text-[16px]">
                        {booking.carName}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-500 text-[14px]">
                      {booking.location || "No location specified"}
                    </p>
                    <p className="text-[12px] text-gray-500">
                      {booking.startTime
                        ? formatTime(booking.startTime)
                        : "N/A"}{" "}
                      -{booking.endTime ? formatTime(booking.endTime) : "N/A"}
                    </p>

                    <div className="flex flex-col pt-4 w-3/4 gap-4">
                      {getActionButton(booking.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
