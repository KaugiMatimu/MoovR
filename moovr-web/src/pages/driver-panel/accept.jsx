import React, { useEffect, useState } from "react";
import Header from "../../components/driver-panel/header";
import { MdOutlinePersonOutline } from "react-icons/md";
import { IoIosStar } from "react-icons/io";
import { BaseURL } from "../../utils/BaseURL";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { DotLoader } from "react-spinners";
import { useSocket } from "../../context/LocationProvider";

const dedupeById = (items) => Array.from(new Map(items.map((item) => [item._id, item])).values());

const Accept = () => {
  const { socket, updateDriverLocation } = useSocket();
  const [availableRides, setAvailableRides] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [availableIntercityRides, setAvailableIntercityRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rides");
  const [acceptingRideId, setAcceptingRideId] = useState(null);
  const navigate = useNavigate();

  const receivedRequestIds = React.useRef({ rides: new Set(), packages: new Set(), intercity: new Set() });

  const fetchAvailableRides = async () => {
    try {
      const token = localStorage.getItem("token");

      const [ridesResponse, reserveResponse, intercityResponse] =
        await Promise.all([
          axios.get(`${BaseURL}/rides/available`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${BaseURL}/package/available`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${BaseURL}/intercityRides/get/available`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      // Log the responses for debugging
      console.log("Rides Response:", ridesResponse?.data);
      console.log("Packages Response:", reserveResponse?.data);
      console.log("Intercity Rides Response:", intercityResponse?.data);

      const uniqueRides = dedupeById(ridesResponse?.data?.availableRides || []);
      const uniquePackages = dedupeById(reserveResponse?.data?.availablePackages || []);
      const uniqueIntercity = dedupeById(intercityResponse?.data?.availableRides || []);

      uniqueRides.forEach((ride) => ride?._id && receivedRequestIds.current.rides.add(ride._id));
      uniquePackages.forEach((pkg) => pkg?._id && receivedRequestIds.current.packages.add(pkg._id));
      uniqueIntercity.forEach((intercity) => intercity?._id && receivedRequestIds.current.intercity.add(intercity._id));

      setAvailableRides(uniqueRides);
      setAvailablePackages(uniquePackages);
      setAvailableIntercityRides(uniqueIntercity);
    } catch (error) {
      toast.error("Error fetching available rides. Please try again.");
      console.error("Error fetching available rides:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableRides();

    if (socket) {
      socket.off("newRide");
      socket.off("newPackage");
      socket.off("newIntercityRide");

      socket.on("newRide", (newRide) => {
        console.log("New ride received via socket:", newRide);
        if (!newRide?._id || receivedRequestIds.current.rides.has(newRide._id)) {
          console.log("Duplicate newRide ignored:", newRide?._id);
          return;
        }
        receivedRequestIds.current.rides.add(newRide._id);
        setAvailableRides((prev) => dedupeById([newRide, ...prev]));
        toast.success("New ride request available!");
      });

      socket.on("newPackage", (newPkg) => {
        console.log("New package received via socket:", newPkg);
        if (!newPkg?._id || receivedRequestIds.current.packages.has(newPkg._id)) {
          console.log("Duplicate newPackage ignored:", newPkg?._id);
          return;
        }
        receivedRequestIds.current.packages.add(newPkg._id);
        setAvailablePackages((prev) => dedupeById([newPkg, ...prev]));
        toast.success("New package request available!");
      });

      socket.on("newIntercityRide", (newIntercity) => {
        console.log("New intercity ride received via socket:", newIntercity);
        if (!newIntercity?._id || receivedRequestIds.current.intercity.has(newIntercity._id)) {
          console.log("Duplicate newIntercityRide ignored:", newIntercity?._id);
          return;
        }
        receivedRequestIds.current.intercity.add(newIntercity._id);
        setAvailableIntercityRides((prev) => dedupeById([newIntercity, ...prev]));
        toast.success("New intercity ride request available!");
      });
    }

    return () => {
      if (socket) {
        socket.off("newRide");
        socket.off("newPackage");
        socket.off("newIntercityRide");
      }
    };
  }, [socket]);

  const handleAccept = async (ride) => {
    try {
      let response;
      const token = localStorage.getItem("token");

      setAcceptingRideId(ride._id);
      if (activeTab === "rides") {
        response = await axios.post(
          `${BaseURL}/rides/accept/${ride._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else if (activeTab === "packages") {
        response = await axios.post(
          `${BaseURL}/package/accept/${ride._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else if (activeTab === "intercity") {
        response = await axios.post(
          `${BaseURL}/intercityrides/accept/${ride._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (response.status === 200) {
        setAcceptingRideId(null);
        // Emit current driver location after acceptance so passenger sees navigation fast
        if (navigator.geolocation && updateDriverLocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              updateDriverLocation(position.coords.latitude, position.coords.longitude, ride._id);
            },
            (error) => {
              console.warn("Could not fetch current driver location after accept:", error);
            },
            { enableHighAccuracy: true }
          );
        }

        // Remove the accepted ride from the respective tab
        if (activeTab === "rides") {
          setAvailableRides((prevRides) =>
            prevRides.filter((r) => r._id !== ride._id)
          );
        } else if (activeTab === "packages") {
          setAvailablePackages((prevRides) =>
            prevRides.filter((r) => r._id !== ride._id)
          );
        } else if (activeTab === "intercity") {
          setAvailableIntercityRides((prevRides) =>
            prevRides.filter((r) => r._id !== ride._id)
          );
        }
        toast.success("Ride accepted successfully!");
        navigate("/d/reached", { state: { ride, activeTab } });
      } else {
        toast.error("Failed to accept the ride. Please try again.");
      }
    } catch (error) {
      setAcceptingRideId(null);
      const serverMessage = error?.response?.data?.message || error?.message || "Error accepting the ride.";
      toast.error(serverMessage);
      console.error("Error accepting the ride:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      if (error?.response?.status === 400) {
        fetchAvailableRides();
      }
    }
  };

  const handleReject = async (ride) => {
    try {
      let response;
      const token = localStorage.getItem("token");

      if (activeTab === "rides") {
        response = await axios.post(
          `${BaseURL}/rides/reject/${ride._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Fallback for other tabs if backend supports rejection
        // If not supported yet, just remove from UI for this driver
        setAvailableRides((prev) => prev.filter((r) => r._id !== ride._id));
        setAvailablePackages((prev) => prev.filter((r) => r._id !== ride._id));
        setAvailableIntercityRides((prev) => prev.filter((r) => r._id !== ride._id));
        toast.success("Request ignored.");
        return;
      }

      if (response.status === 200) {
        if (activeTab === "rides") {
          setAvailableRides((prevRides) =>
            prevRides.filter((r) => r._id !== ride._id)
          );
        }
        toast.success("Ride rejected.");
      }
    } catch (error) {
      toast.error("Error rejecting the ride.");
      console.error("Error rejecting the ride:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-100 flex items-center justify-center">
          <DotLoader color="#A75AF2" />
        </main>
      </div>
    );
  }

  const renderRides = (rides) => (
    <div className="grid grid-cols-1 gap-4 p-4">
      {rides.length > 0 ? (
        rides.map((ride) => (
          <div
            key={ride._id}
            className="relative bg-white shadow-lg rounded-lg p-6 max-w-[282px] mx-auto"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex flex-col justify-center items-center w-full gap-1">
                <div className="w-10 h-10 bg-primaryPurple rounded-full flex items-center justify-center text-white overflow-hidden">
                  {ride.user?.profilePicture ? (
                    <img src={ride.user.profilePicture} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <MdOutlinePersonOutline size={25} />
                  )}
                </div>
                <h2 className="text-[16px] font-[600]">
                  {ride.user ? `${ride.user.firstName} ${ride.user.lastName}` : (ride.driverName || "MoovR X")}
                </h2>
                <p className="font-[600] text-[24px]">
                  <span className="text-[14px] mr-1">₦</span>
                  {ride.fare}
                </p>
                <p className="text-[12px] text-black/50">Includes 5% tax</p>
                <p className="flex items-center gap-2 text-[12px] text-black">
                  <IoIosStar className="text-primaryPurple" />{" "}
                  {ride.rating || 4.3} {ride.paymentMethod || "Cash"} Payment
                </p>
                <p className="text-[12px] text-black/50">{ride.type}</p>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <img
                className="mt-2"
                src="/driver/horizontal-sm-connector.svg"
                alt=""
              />
              <div>
                <div className="mb-4 text-black text-[16px]">
                  <p>
                    <span>
                      {ride.timeToPickup || "5 mins"} (
                      {ride.distanceToPickup || "1.3km"})
                    </span>{" "}
                    away
                  </p>
                  <p className="text-[12px] text-black/50">
                    {ride.pickupLocation}
                  </p>
                </div>
                <div>
                  <p>
                    <span>
                      {ride.estimatedTime || "15 mins"} (
                      {ride.estimatedDistance || "4.5km"})
                    </span>{" "}
                    trip
                  </p>
                  <p className="text-[12px] text-black/50">
                    Dropoff: {ride.dropoffLocation}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleReject(ride)}
                className="bg-gray-200 text-black w-1/3 py-4 font-[600] rounded-full hover:bg-red-100 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleAccept(ride)}
                className="bg-primaryPurple text-white flex-1 py-4 font-[600] rounded-full"
              >
                Accept
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center text-gray-500">
          No rides available.
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-100">
        <div className="flex justify-center mt-4">
          <button
            className={`px-4 py-2 mx-2 rounded-full ${
              activeTab === "rides" ? "bg-primaryPurple text-white" : "bg-white"
            }`}
            onClick={() => setActiveTab("rides")}
          >
            Rides
          </button>
          <button
            className={`px-4 py-2 mx-2 rounded-full ${
              activeTab === "packages"
                ? "bg-primaryPurple text-white"
                : "bg-white"
            }`}
            onClick={() => setActiveTab("packages")}
          >
            packages
          </button>
          <button
            className={`px-4 py-2 mx-2 rounded-full ${
              activeTab === "intercity"
                ? "bg-primaryPurple text-white"
                : "bg-white"
            }`}
            onClick={() => setActiveTab("intercity")}
          >
            Intercity Rides
          </button>
        </div>

        {activeTab === "rides" && renderRides(availableRides)}
        {activeTab === "packages" && renderRides(availablePackages)}
        {activeTab === "intercity" && renderRides(availableIntercityRides)}
      </main>
    </div>
  );
};

export default Accept;
