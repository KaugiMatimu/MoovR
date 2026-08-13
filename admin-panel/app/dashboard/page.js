"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";

import { Card, CardBody } from "@nextui-org/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { Avatar } from "@nextui-org/avatar";

import { Users, Car, DollarSign } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { BaseURL } from "@/utils/baseURL";

export default function DashboardPage() {
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [recentBooking, setRecentBooking] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [cabs, setCabs] = useState([]);
  const [pendingRentRequests, setPendingRentRequests] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalEarning: 0,
    todayEarning: 0,
    totalUsers: 0,
    totalDrivers: 0,
    pendingDrivers: 0,
    totalRides: 0
  });

  const router = useRouter();

  useEffect(() => {
    const fetchAdminStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${BaseURL}/revenue/admin-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setAdminStats(res.data.stats);
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      }
    };

    fetchAdminStats();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.replace("/login");

      try {
        const res = await axios.get(`${BaseURL}/auth/users`, {});

        if (res.data.users) {
          const allUsers = res.data.users;
          const usersOnly = allUsers.filter((user) => user.role === "user");
          const driversOnly = allUsers.filter((user) => user.role === "driver");

          console.log("your geting user api response:",res);

          setUsers(usersOnly);
          setDrivers(driversOnly);

          const sortedRecent = [...usersOnly]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map((user) => ({
              name: user.firstName ? `${user.firstName} ${user.lastName}` : (user.phone || "Unnamed User"),
              profilePicture: user.profilePicture,
              time: format(new Date(user.createdAt), "hh:mm a"),
              date: format(new Date(user.createdAt), "dd MMMM yyyy"),
            }));

          setRecentUsers(sortedRecent);
        }
      } catch (err) {
        console.error("Error fetching users:", err.response?.data || err.message);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    axios
      .get(`${BaseURL}/cars/list`)
      .then((res) => {
        setCabs(res.data.cars || []);
      })
      .catch((err) => {
        console.error("Failed to fetch cabs:", err);
      });
  }, []);

  const stats = [
    {
      title: "Total Cab",
      value: cabs.length,
      icon: Car,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      title: "Today's Earning",
      value: `₦ ${adminStats.todayEarning}`,
      icon: DollarSign,
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-500",
    },
    {
      title: "Total Earning",
      value: `₦ ${adminStats.totalEarning}`,
      icon: DollarSign,
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
    },
  ];

  const userData = [
    { name: "User", value: adminStats.totalUsers, color: "#00B5FF" },
    { name: "Driver", value: adminStats.totalDrivers, color: "#FF8C00" },
  ];

  useEffect(() => {
    const getBookingData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.replace("/login");

      try {
        const res = await axios.get(
          `${BaseURL}/bookings/past/all/users/booking`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data && res.data.bookings?.length) {
          const sorted = res.data.bookings.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setBookingData(sorted);
          setRecentBooking(sorted[0]);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error.response?.data || error.message);
      }
    };

    getBookingData();
  }, []);

  useEffect(() => {
    const fetchPendingRentRequests = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${BaseURL}/rent/requests/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPendingRentRequests(res.data.pendingRequests || []);
      } catch (error) {
        console.error("Error fetching pending rent requests:", error.response?.data || error.message);
      }
    };

    fetchPendingRentRequests();
  }, []);

  const handleRentRequestStatus = async (carId, rentalId, status) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.put(
        `${BaseURL}/rent/requests/${carId}/${rentalId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPendingRentRequests((prev) =>
        prev.filter((request) => !(request.carId === carId && request._id === rentalId))
      );
    } catch (error) {
      console.error("Error updating rental request status:", error.response?.data || error.message);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm">
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-500">
              <Users />
            </div>
            <div>
              <p className="text-sm text-gray-500">Passengers</p>
              <h3 className="text-2xl font-bold">{adminStats.totalUsers}</h3>
            </div>
          </CardBody>
        </Card>

        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm">
            <CardBody className="flex flex-row items-center gap-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`${stat.iconColor}`} size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardBody>
            <h3 className="text-xl font-semibold mb-4">Total Booking</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFA500" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FFA500" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="amount" stroke="#FFA500" fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm">
          <CardBody>
            <h3 className="text-xl font-semibold mb-4">Total Users</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {userData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardBody>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Pending Rent Requests</h3>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
              {pendingRentRequests.length} pending
            </span>
          </div>

          {pendingRentRequests.length === 0 ? (
            <p className="text-gray-500">No pending rental requests.</p>
          ) : (
            <div className="space-y-4">
              {pendingRentRequests.map((request) => (
                <div
                  key={`${request.carId}-${request._id}`}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={request.image || "/images/BMW.png"}
                      alt={request.vehicleName || "Rental car"}
                      className="h-16 w-20 rounded-md object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{request.vehicleName || "Car"}</p>
                      <p className="text-sm text-gray-500">
                        {request.user?.firstName || "User"} {request.user?.lastName || ""}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.deliveryLocation || "Pickup location not set"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(request.startDate), "dd MMM yyyy")} - {format(new Date(request.endDate), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRentRequestStatus(request.carId, request._id, "approved")}
                      className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRentRequestStatus(request.carId, request._id, "rejected")}
                      className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Recent Bookings</h3>
              <button className="text-blue-500 hover:underline">View all</button>
            </div>
            {recentBooking ? (
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold mb-2">Most Recent Booking</h3>
                <p>Booking ID: {recentBooking._id}</p>
                <p>Date: {new Date(recentBooking.createdAt).toLocaleString()}</p>
                <p>Status: {recentBooking.status}</p>
              </div>
            ) : (
              <p>No recent bookings found.</p>
            )}
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm">
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Recent Users</h3>
              <button className="text-blue-500 hover:underline">View all</button>
            </div>
            <div className="space-y-4">
              {recentUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Avatar 
                    src={user.profilePicture || "/placeholder.svg"} 
                    size="sm" 
                    className="flex-shrink-0" 
                    name={user.name?.charAt(0)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.time} | {user.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
