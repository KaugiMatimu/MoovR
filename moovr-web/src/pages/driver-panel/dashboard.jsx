"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiChevronDown, FiStar } from "react-icons/fi";
import { PieChart, Pie, Cell } from "recharts";
import Header from "../../components/driver-panel/header";
import { Link } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../utils/BaseURL";
import Cookies from "js-cookie";

const Card = ({ children, className = "", ...props }) => (
  <div
    className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const FilterDropdown = ({ selected = "This Month" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 bg-purple-100 text-sm rounded-full flex items-center gap-1 text-purple-600"
      >
        {selected}
        <FiChevronDown
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg z-10">
          <button className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg">
            This Month
          </button>
          <button className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg">
            Last Month
          </button>
        </div>
      )}
    </div>
  );
};

const StarRating = ({ rating = 5, size = "large" }) => {
  const stars = Array(5).fill(0);
  return (
    <div className="flex items-center justify-center gap-1">
      {stars.map((_, index) => (
        <FiStar
          key={index}
          className={`${
            index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          } ${size === "large" ? "w-8 h-8" : "w-4 h-4"}`}
        />
      ))}
    </div>
  );
};

const getAuthToken = () => {
  const storageToken = localStorage.getItem("token");
  const cookieToken = Cookies.get("token");

  if (storageToken && storageToken !== "null" && storageToken !== "undefined") {
    return storageToken;
  }
  if (cookieToken && cookieToken !== "null" && cookieToken !== "undefined") {
    return cookieToken;
  }

  return null;
};

const parseStoredUser = () => {
  const rawUser =
    localStorage.getItem("userData") ||
    localStorage.getItem("user") ||
    Cookies.get("userData") ||
    Cookies.get("user");

  if (!rawUser || rawUser === "undefined" || rawUser === "null") {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    console.warn("Failed to parse stored user data", rawUser, error);
    return null;
  }
};

const fetchCurrentUser = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${BaseURL}/auth/get-user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = response.data?.user;
    if (user) {
      localStorage.setItem("userData", JSON.stringify(user));
      try {
        if (user.role) {
          localStorage.setItem("role", user.role);
          Cookies.set("role", user.role, { expires: 7, path: "/" });
        }
      } catch (e) {
        console.warn("Failed to persist role in storage/cookie:", e);
      }
    }
    return user;
  } catch (error) {
    console.warn("Failed to fetch current user", error);
    return null;
  }
};

const normalizeStatus = (status) => String(status || "").toLowerCase();

const parseDriverRidesResponse = (data) => {
  if (!data) return [];
  if (Array.isArray(data.driverRides)) return data.driverRides;
  if (Array.isArray(data.rides)) return data.rides;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.response)) return data.response;
  if (Array.isArray(data.driverRides?.data)) return data.driverRides.data;
  if (Array.isArray(data.data?.driverRides)) return data.data.driverRides;
  if (Array.isArray(data.data?.rides)) return data.data.rides;
  if (Array.isArray(data.response?.driverRides)) return data.response.driverRides;
  if (Array.isArray(data.driverRides?.rides)) return data.driverRides.rides;
  if (Array.isArray(data.data?.response)) return data.data.response;
  if (Array.isArray(data)) return data;
  return [];
};

const getNumericValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function Dashboard() {
  const [ridesData, setRidesData] = useState([]);
  const [totalRides, setTotalRides] = useState(0);
  const [completedPercentage, setCompletedPercentage] = useState(0);
  const [canceledPercentage, setCanceledPercentage] = useState(0);
  const [activeRides, setActiveRides] = useState(0);
  const [totalListings, setTotalListings] = useState(0);
  const [averageRating, setAverageRating] = useState(0); // State for average rating
  const [reviewsData, setReviewsData] = useState([]); // State for reviews data
  const [lastComputedRating, setLastComputedRating] = useState(null);
  const [lastComputedListings, setLastComputedListings] = useState(null);
  const [lastComputedBookings, setLastComputedBookings] = useState(null);
  const [listingsData, setListingsData] = useState([]); // State for reviews data
  const [totalRevenue, setTotalRevenue] = useState(0); // State for total revenue
  const [lastComputedRevenue, setLastComputedRevenue] = useState(null);
  const [totalBookings, setTotalBookings] = useState(0); // State for total bookings
  const displayRevenue = lastComputedRevenue ?? totalRevenue;
  const formattedDisplayRevenue =
    displayRevenue == null
      ? "0"
      : (typeof displayRevenue === "number"
          ? displayRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })
          : String(displayRevenue));

  useEffect(() => {
    try {
      const el = document.getElementById("dashboard-total-revenue");
      if (el) {
        el.textContent = `₦${formattedDisplayRevenue}`;
        console.log("DOM write: dashboard-total-revenue ->", formattedDisplayRevenue);
      }
    } catch (e) {
      console.warn("Failed to write DOM revenue:", e);
    }
  }, [formattedDisplayRevenue]);

  const displayRating = lastComputedRating ?? averageRating;
  const formattedDisplayRating = displayRating == null ? "0" : (typeof displayRating === "number" ? String(displayRating.toFixed(1)) : String(displayRating));

  useEffect(() => {
    try {
      const el = document.getElementById("dashboard-average-rating");
      if (el) {
        el.textContent = formattedDisplayRating;
        console.log("DOM write: dashboard-average-rating ->", formattedDisplayRating);
      }
    } catch (e) {
      console.warn("Failed to write DOM rating:", e);
    }
  }, [formattedDisplayRating]);

  const displayListings = lastComputedListings ?? totalListings;
  const formattedDisplayListings = displayListings == null ? "0" : (typeof displayListings === "number" ? String(displayListings) : String(displayListings));

  useEffect(() => {
    try {
      const el = document.getElementById("dashboard-total-listings");
      if (el) {
        el.textContent = formattedDisplayListings;
        console.log("DOM write: dashboard-total-listings ->", formattedDisplayListings);
      }
    } catch (e) {
      console.warn("Failed to write DOM listings:", e);
    }
  }, [formattedDisplayListings]);

  const displayBookings = lastComputedBookings ?? totalBookings;
  const formattedDisplayBookings = displayBookings == null ? "0" : (typeof displayBookings === "number" ? String(displayBookings) : String(displayBookings));

  useEffect(() => {
    try {
      const el = document.getElementById("dashboard-total-bookings");
      if (el) {
        el.textContent = formattedDisplayBookings;
        console.log("DOM write: dashboard-total-bookings ->", formattedDisplayBookings);
      }
    } catch (e) {
      console.warn("Failed to write DOM bookings:", e);
    }
  }, [formattedDisplayBookings]);
  const [rideWarning, setRideWarning] = useState("");
  const [debugPayloads, setDebugPayloads] = useState({});
  const instanceId = useRef(Math.random().toString(36).slice(2, 8));

  useEffect(() => {
    console.log("render dashboard state", { instanceId: instanceId.current, 
      totalRides,
      ridesData,
      activeRides,
      completedPercentage,
      canceledPercentage,
      totalRevenue,
      totalListings,
      totalBookings,
      averageRating,
    });
  }, [totalRides, ridesData, activeRides, completedPercentage, canceledPercentage]);

  useEffect(() => {
    console.log("dashboard numeric states:", { instanceId: instanceId.current, totalRevenue, totalListings, totalBookings, averageRating });
  }, [totalRevenue, totalListings, totalBookings, averageRating]);

  useEffect(() => {
    if (debugPayloads && debugPayloads['/revenue']) {
      console.log("debugPayloads /revenue changed:", { instanceId: instanceId.current, payload: debugPayloads['/revenue'] });
    }
  }, [debugPayloads['/revenue']]);

  const getDashboardToken = () => {
    const token = getAuthToken();
    if (!token || token === "null" || token === "undefined") {
      console.error("Driver dashboard: auth token is missing or invalid");
      return null;
    }
    return token;
  };

  const buildRequestUrl = (path) => {
    const cleanBase = BaseURL.replace(/\/+$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  };

  const extractPayload = (responseData) => {
    if (!responseData) return null;
    // Unwrap nested `.data` layers until we hit a non-object or no more `.data`
    let current = responseData;
    let safety = 0;
    while (current && typeof current === "object" && current.data !== undefined && safety < 6) {
      current = current.data;
      safety += 1;
    }
    return current;
  };

  const getArrayFromPayload = (payload, possibleKeys = []) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    for (const key of possibleKeys) {
      if (!key) continue;
      const parts = key.split(".");
      let v = payload;
      for (const p of parts) {
        if (!v) break;
        v = v[p];
      }
      if (Array.isArray(v)) return v;
    }
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.response)) return payload.response;
    return [];
  };

  const getNumberFromPayload = (...candidates) => {
    for (const c of candidates) {
      const n = Number(c);
      if (Number.isFinite(n)) return n;
    }
    return 0;
  };

  const fetchDashboardJson = async (path) => {
    // Prefer native fetch (consistent with `revenue.jsx`) and localStorage token usage.
    const token = localStorage.getItem("token") || Cookies.get("token");
    if (!token) {
      console.error("Dashboard request: missing auth token");
      return null;
    }

    try {
      const url = buildRequestUrl(path);
      console.debug("Dashboard fetch request:", url, "Authorization:", token ? `${token.substring(0, 10)}...` : null);
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Fetch failed with status ${res.status}`);
      }

      const json = await res.json();
      const payload = extractPayload(json);
      console.debug("Dashboard fetch payload:", payload);
      try { setDebugPayloads((s) => ({ ...s, [path]: payload })); } catch (e) { console.warn(e); }
      return payload;
    } catch (fetchError) {
      console.warn("Fetch request failed, trying axios fallback:", fetchError?.message);
      try {
        const resp = await axios.get(buildRequestUrl(path), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || Cookies.get("token")}` },
        });
        const payload = extractPayload(resp.data);
        try { setDebugPayloads((s) => ({ ...s, [path]: payload })); } catch (e) {}
        return payload;
      } catch (axiosError) {
        console.error(`Dashboard axios fallback failed (${path}):`, axiosError?.response ?? axiosError?.message ?? axiosError);
        if (axiosError.response?.status === 401) {
          try { await fetchCurrentUser(); } catch (e) { console.warn("Failed to refresh current user:", e); }
        }
        return null;
      }
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const payload = await fetchDashboardJson("/bookings/driver-bookings");
        if (!payload) {
          setTotalBookings(0);
          try { setLastComputedBookings(0); console.log("fetchBookings: setLastComputedBookings", { instanceId: instanceId.current, value: 0 }); } catch (e) {}
          return;
        }

        const bookingsData = getArrayFromPayload(payload, [
          "bookings",
          "bookingsList",
          "result",
          "driverBookings",
        ]);

        if (!Array.isArray(bookingsData)) {
          console.warn("Unexpected bookings payload:", payload);
        }

        const bookingsCount = Array.isArray(bookingsData) ? bookingsData.length : 0;
        setTotalBookings(bookingsCount);
        try { setLastComputedBookings(bookingsCount); console.log("fetchBookings: setLastComputedBookings", { instanceId: instanceId.current, value: bookingsCount }); } catch (e) {}
      } catch (error) {
        console.error("Error fetching bookings data:", error);
        setTotalBookings(0);
      }
    };

    fetchBookings();
  }, []);

  // Fetch revenue data
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
          const payload = await fetchDashboardJson("/revenue");
          console.log("/revenue ->", { instanceId: instanceId.current, payload });
        if (!payload) {
          console.warn("fetchRevenue: payload missing — setting totalRevenue to 0");
          setTotalRevenue(0);
          return;
        }

        const revenuePayload = payload;
        const totalFromDays = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].reduce((sum, day) => sum + getNumberFromPayload(revenuePayload?.[day], revenuePayload?.data?.[day]), 0);
        const revenueValue =
          getNumberFromPayload(
            revenuePayload.totalRevenue,
            revenuePayload.Total,
            revenuePayload.total,
            revenuePayload.totalRevenueAmount,
            revenuePayload.data?.totalRevenue,
            revenuePayload.data?.Total,
            totalFromDays
          );
        const computedRevenue = Math.max(revenueValue, totalFromDays);

        console.log("/revenue computed", { instanceId: instanceId.current, revenuePayload, totalFromDays, revenueValue, computedRevenue });

        console.log("/revenue types", { instanceId: instanceId.current, revenuePayloadType: typeof revenuePayload, totalFromDaysType: typeof totalFromDays, revenueValueType: typeof revenueValue, computedRevenueType: typeof computedRevenue });

        setTotalRevenue(computedRevenue);
        console.log("fetchRevenue: setTotalRevenue(computedRevenue)", { instanceId: instanceId.current, computedRevenue });
        try { setLastComputedRevenue(computedRevenue); console.log("fetchRevenue: setLastComputedRevenue", { instanceId: instanceId.current, computedRevenue }); } catch (e) {}
      } catch (error) {
        console.error("Error fetching revenue:", error);
        console.warn("fetchRevenue: catch — setting totalRevenue to 0");
        setTotalRevenue(0);
      }
    };

    fetchRevenue();
  }, []);

  // Fetch reviews data
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const payload = await fetchDashboardJson("/reviews");
        if (!payload) {
          setReviewsData([]);
          setAverageRating(0);
          return;
        }

        const reviewsPayload = payload;
        const reviews = getArrayFromPayload(reviewsPayload, ["reviews"]);
        const normalized = Array.isArray(reviews) ? reviews : [];
        const averageRatingValue =
          getNumberFromPayload(reviewsPayload.averageRating, reviewsPayload.avgRating, reviewsPayload.average, reviewsPayload.rating, 0);

        const computedAverage = normalized.length > 0
          ? normalized.reduce((s, r) => s + getNumberFromPayload(r.rating), 0) / normalized.length
          : averageRatingValue;

        setReviewsData(normalized);
        const avgRounded = Number(computedAverage.toFixed(1));
        setAverageRating(avgRounded);
        try { setLastComputedRating(avgRounded); console.log("fetchReviews: setLastComputedRating", { instanceId: instanceId.current, avgRounded }); } catch (e) {}
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviewsData([]);
        setAverageRating(0);
      }
    };

    fetchReviews();
  }, []);

  // Fetch ride data
  useEffect(() => {
    const fetchRides = async () => {
      try {
        const payload = await fetchDashboardJson("/rides/driver");
        console.log("/rides/driver payload", payload);

        if (!payload) {
          setTotalRides(0);
          setRidesData([]);
          setActiveRides(0);
          setCompletedPercentage(0);
          setCanceledPercentage(0);
          return;
        }

        const ridesArray =
          getArrayFromPayload(payload, ["driverRides", "rides", "data", "response"]) || parseDriverRidesResponse(payload);

        const total = Array.isArray(ridesArray) ? ridesArray.length : 0;
        const completedRides = Array.isArray(ridesArray)
          ? ridesArray.filter((ride) => normalizeStatus(ride.status) === "completed").length
          : 0;
        const canceledRides = Array.isArray(ridesArray)
          ? ridesArray.filter((ride) =>
              ["cancelled", "canceled", "rejected"].includes(normalizeStatus(ride.status))
            ).length
          : 0;
        const activeRidesCount = Array.isArray(ridesArray)
          ? ridesArray.filter((ride) =>
              ["pending", "accepted", "running"].includes(normalizeStatus(ride.status))
            ).length
          : 0;

        console.log("dashboard computed rides", {
          total,
          completedRides,
          canceledRides,
          activeRidesCount,
          ridesArrayLength: Array.isArray(ridesArray) ? ridesArray.length : null,
        });

        setTotalRides(total);
        setActiveRides(activeRidesCount);
        setCompletedPercentage(total > 0 ? Number(((completedRides / total) * 100).toFixed(1)) : 0);
        setCanceledPercentage(total > 0 ? Number(((canceledRides / total) * 100).toFixed(1)) : 0);
        setRidesData([
          { name: "Completed", value: completedRides, color: "#8257E9" },
          { name: "Canceled", value: canceledRides, color: "#4C1D95" },
          { name: "Active", value: activeRidesCount, color: "#A855F7" },
        ]);
      } catch (error) {
        console.error("Error fetching driver rides:", error);
        setTotalRides(0);
        setRidesData([]);
        setActiveRides(0);
        setCompletedPercentage(0);
        setCanceledPercentage(0);
      }
    };

    fetchRides();
  }, []);

  // Fetch listings data
  useEffect(() => {
    const fetchListings = async () => {
      try {
        let userData = await fetchCurrentUser();
        let driverId = userData?._id || userData?.id;

        if (!driverId) {
          console.error("Driver ID missing from authenticated user response");
          setTotalListings(0);
          setListingsData([]);
          return;
        }

        const payload = await fetchDashboardJson(`/cars/driver/${driverId}/cars`);
        if (!payload) {
          setTotalListings(0);
          setListingsData([]);
          return;
        }

        const carsPayload = payload;
        const cars = getArrayFromPayload(carsPayload, ["cars", "carListings", "data.cars", "data.carListings"]);

        const activeListings = cars.filter((car) => car.status === "active").length;
        const inactiveListings = cars.filter((car) => car.status === "inactive").length;
        const canceledListings = cars.filter((car) => car.status === "canceled").length;

        const totalCars = Number(Array.isArray(cars) ? cars.length : 0);
        const listingsCount = Number(totalCars) || 0;
        setTotalListings(listingsCount);
        try { setLastComputedListings(listingsCount); console.log("fetchListings: setLastComputedListings", { instanceId: instanceId.current, listingsCount }); } catch (e) {}

        if (inactiveListings === totalCars) {
          setListingsData([
            { name: "Inactive", value: totalCars, color: "#7C3AED" },
          ]);
        } else {
          setListingsData([
            { name: "Active", value: activeListings, color: "#A855F7" },
            { name: "Inactive", value: inactiveListings, color: "#7C3AED" },
            { name: "Cancelled", value: canceledListings, color: "#EF4444" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching car listings:", error);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-xl font-medium mb-6">Dashboard</h1>
        {rideWarning ? (
          <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {rideWarning}
          </div>
        ) : null}

        {/* Action Row */}
        <div className="mb-6">
          <Link to="/d/location">
            <button className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg hover:bg-purple-700 shadow-md transition-colors flex items-center justify-center gap-2">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              Go Online to Accept Rides
            </button>
          </Link>
        </div>

        {/* Debug Panel */}
        {/* Top Row Stats */}
        <div className="grid md:grid-cols-3 justify-center gap-6 mb-6 mx-auto">
          {/* Revenue Card */}
          <Card className="shadow-md">
            <Link to="/d/revenue">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-gray-600">Total Revenue</h2>
                <FilterDropdown />
              </div>
              <div className="flex flex-col items-center justify-center pt-3">
                <p id="dashboard-total-revenue" className="text-[32px] font-semibold">₦{formattedDisplayRevenue}</p>
                <p className="text-sm text-gray-500 mt-1">till now</p>
              </div>
            </Link>
          </Card>
          {/* Rides Card */}
          <Card className="shadow-md" key={`rides-card-${totalRides}`}>
            <Link to="/d/rides">
              <div className="flex justify-between items-start">
                <h2 className="text-gray-600">Total Rides</h2>
                <FilterDropdown />
              </div>
              <div className="flex justify-center mt-6">
                <div className="relative">
                  <PieChart width={120} height={120}>
                    <Pie
                      data={ridesData}
                      cx={60}
                      cy={60}
                      innerRadius={40}
                      outerRadius={55}
                      startAngle={90}
                      endAngle={450}
                      dataKey="value"
                    >
                      {ridesData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <text
                      id="dashboard-total-rides"
                      x="53%"
                      y="56%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-2xl font-bold"
                    >
                      {totalRides}
                    </text>
                  </PieChart>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">Total driver rides</p>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#8257E9]" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4C1D95]" />
                  <span>Canceled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#A855F7]" />
                  <span>Active</span>
                </div>
              </div>
            </Link>
          </Card>
          {/* Other Cards */}
          <Card className="shadow-md">
            <Link to="/d/rating">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-gray-600">Ratings</h2>
                <FilterDropdown />
              </div>
              <div className="text-center flex flex-col items-center justify-center">
                <img src="/driver/stars.svg" alt="" />
                <p id="dashboard-average-rating" className="text-3xl font-bold mt-4 text-gray-700">{formattedDisplayRating}</p>
                <p className="text-gray-500">Rated by {reviewsData.length} people</p>
              </div>
            </Link>
          </Card>
          <Card className="shadow-md">
            <Link to="/d/listing">
              <div className="flex justify-between items-start">
                <h2 className="text-gray-600">Total Listings</h2>
                <FilterDropdown />
              </div>
              <div className="flex justify-center mt-4">
                <div className="relative">
                  <PieChart width={120} height={120}>
                    <Pie
                      data={listingsData} // Use dynamic listings data
                      cx={60}
                      cy={60}
                      innerRadius={40}
                      outerRadius={55}
                      startAngle={90}
                      endAngle={450}
                      dataKey="value"
                    >
                      {listingsData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <text
                      id="dashboard-total-listings"
                      x="53%"
                      y="56%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-2xl font-bold"
                    >
                      {formattedDisplayListings}
                    </text>
                  </PieChart>
                </div>
              </div>

            </Link>
          </Card>
          {/* Bookings Card */}
          <Card className="shadow-md">
            <Link to="/d/bookings">
              <div className="flex justify-between items-start">
                <h2 className="text-gray-600">Total Bookings</h2>
                <FilterDropdown />
              </div>
              <div className="flex flex-col items-center justify-center pt-3">
                <PieChart width={120} height={120}>
                  <Pie
                    data={[
                      { name: "Total Bookings", value: totalBookings, color: "#A855F7" },
                      { name: "Remaining", value: Math.max(0, 100 - totalBookings), color: "#E5E7EB" },
                    ]}
                    cx={60}
                    cy={60}
                    innerRadius={40}
                    outerRadius={55}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                  >
                    {[{ name: "Total Bookings", color: "#A855F7" }, { name: "Remaining", color: "#E5E7EB" }].map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <text
                    id="dashboard-total-bookings"
                    x="53%"
                    y="56%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-2xl font-bold"
                  >
                    {formattedDisplayBookings}
                  </text>
                </PieChart>
              </div>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}
