"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import axios from "axios";
import { BaseURL } from "../../../utils/baseURL";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PassengersPage() {
  const [allUsers, setAllUsers] = useState([]);
  const router = useRouter();

  // Fetch all users
  const getAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token not found. Please login.");
        router.replace("/");
        return;
      }

      const response = await axios.get(`${BaseURL}/auth/all/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const users = response.data?.users || [];
      const passengersOnly = users.filter(user => user.role === "user");
      console.log("your passengers are :", passengersOnly);
      setAllUsers(passengersOnly);
      // toast.success("Users fetched successfully");
    } catch (error) {
      toast.error("Failed to fetch users");
      setAllUsers([]);
    }
  };

  // Change user verification status
  const changeTheUserStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token missing");
      console.log("your update id is :", id);
      console.log("your status is :", status);
      if (!id || typeof status !== "boolean") {
        toast.error("ID and status are required");
        return;
      }

      const response = await axios.put(
        `${BaseURL}/auth/disable/user`,
        { id, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("your status api response :", response);
      if (response.data?.success) {
        const updatedUsers = allUsers.map((user) => {
          if (user._id === id) {
            return {
              ...user,
              isVerified: status,
              verificationStatus: status ? "Verified" : "Disabled",
            };
          }
          return user;
        });
        setAllUsers(updatedUsers);
        toast.success(
          status ? "User enabled successfully" : "User disabled successfully"
        );
      } else {
        throw new Error(response.data.message || "Failed to update user");
      }
    } catch (error) {
      toast.error(error.response.message || "Something went wrong");
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50/50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-orange-500">Users</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 justify-end">
        <Select>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Name" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="date">Date</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex items-center">
          <Input placeholder="Search here" className="w-64 pl-8" />
          <Search className="absolute left-2 h-4 w-4 text-gray-400" />
        </div>

        <Select>
          <SelectTrigger className="w-20">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-50/80">PROFILE IMAGE</TableHead>
              <TableHead className="bg-gray-50/80">FULL NAME</TableHead>
              <TableHead className="bg-gray-50/80">GENDER</TableHead>
              <TableHead className="bg-gray-50/80">CREATED AT</TableHead>
              <TableHead className="bg-gray-50/80">WALLET AMOUNT</TableHead>
              <TableHead className="bg-gray-50/80">STATUS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {allUsers.length > 0 ? (
              allUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage
                        src={user.profileImage || "/placeholder.svg"}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                      <AvatarFallback>
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-gray-500 text-sm">{user.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{user.gender}</TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell>{user.walletAmount}</TableCell>
                  <TableCell>
                    <Switch
                      checked={user.isVerified}
                      onClick={() =>
                        changeTheUserStatus(user._id, !user.isVerified)
                      }
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
