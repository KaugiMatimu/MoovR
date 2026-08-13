"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
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
import { Eye, Pencil, Trash, ChevronDown, Search, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { BaseURL } from "@/utils/baseURL";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// const drivers = [
//   {
//     id: 1,
//     name: "Vikas",
//     phone: "+91 xxxxxxxx89",
//     gender: "Male",
//     createdAt: "05 February 2025 10:55 AM",
//     isVerify: "Verify",
//     walletAmount: "$ 7076.64",
//     status: true,
//   },
//   {
//     id: 2,
//     name: "taxi Alex",
//     phone: "+32 xxxxxxx05",
//     gender: "Male",
//     createdAt: "04 February 2025 11:19 PM",
//     isVerify: "Verify",
//     walletAmount: "$ 4684.47",
//     status: true,
//   },
//   {
//     id: 3,
//     name: "malik ahmed",
//     phone: "+20 xxxxxxxx82",
//     gender: "Male",
//     createdAt: "03 February 2025 07:13 AM",
//     isVerify: "Verify",
//     walletAmount: "$ 0.00",
//     status: false,
//   },
//   {
//     id: 4,
//     name: "Asdf",
//     phone: "+91 xxxxxxxx50",
//     gender: "Male",
//     createdAt: "02 February 2025 04:30 PM",
//     isVerify: "Is not Verify",
//     walletAmount: "$ 50.00",
//     status: false,
//   },
//   // Add more drivers as needed
// ];

export default function DriversPage() {
  const [allDrivers, setAllDrivers] = useState(null)
  const router = useRouter();
  const getAllDrivers = async () => {
    try {
      let token = localStorage.getItem('token')
   if(!token) return router.replace('/')

      const response = await axios.get(`${BaseURL}/auth/all/drivers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      console.log(response);
      const drivers = await response.data;
      console.log(drivers, ' the user data');
      // Only update state if data exists
      if (drivers) {
        setAllDrivers(drivers.drivers);
      }
    } catch (error) {
      setAllDrivers([]);
    }
  };
  const changeTheDriverStatus = async (id, newStatus) => {
  try {
    if (!id) throw new Error("Driver ID is required");

    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${BaseURL}/auth/disable/driver`,
      { id, status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      const updatedDrivers = allDrivers.map((d) =>
        d._id === id
          ? {
              ...d,
              isVerified: newStatus,
              verificationStatus: newStatus ? "Verified" : "Disabled",
            }
          : d
      );

      setAllDrivers(updatedDrivers);

      toast.success(newStatus ? "Driver enabled successfully" : "Driver disabled successfully");
    } else {
      throw new Error(response.data.message || "Failed to update driver status");
    }
  } catch (error) {
    console.error("Error updating driver:", error.message);
    toast.error(error.response?.data?.message || error.message || "Something went wrong");
  }
};

const deleteDriver = async (id) => {
  if (!window.confirm("Are you sure you want to delete this driver?")) return;
  
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${BaseURL}/auth/driver/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      setAllDrivers(allDrivers.filter((d) => d._id !== id));
      toast.success("Driver deleted successfully");
    } else {
      throw new Error(response.data.message || "Failed to delete driver");
    }
  } catch (error) {
    console.error("Error deleting driver:", error.message);
    toast.error(error.response?.data?.message || error.message || "Something went wrong");
  }
};

  useEffect(() => {
    getAllDrivers();
  }, [])
  return (
    <div className="p-6 space-y-6 bg-gray-50/50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Driver</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-orange-500">Driver</span>
          </div>
        </div>
      </div>

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

      <div className="bg-white rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-50/80">PROFILE IMAGE</TableHead>
              <TableHead className="bg-gray-50/80">FULL NAME</TableHead>
              <TableHead className="bg-gray-50/80">GENDER</TableHead>
              <TableHead className="bg-gray-50/80">CREATED AT</TableHead>
              <TableHead className="bg-gray-50/80">IS VERIFY</TableHead>
              <TableHead className="bg-gray-50/80">WALLET AMOUNT</TableHead>
              <TableHead className="bg-gray-50/80">STATUS</TableHead>
              <TableHead className="bg-gray-50/80">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allDrivers && allDrivers.map((driver) => (
              <TableRow key={driver._id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={driver.profilePicture || "/placeholder.svg"} alt={driver.firstName} />
                    <AvatarFallback>{driver.firstName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-medium">{driver.firstName + " " + driver.lastName}</p>
                      {driver.isVerified && <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />}
                    </div>
                    <p className="text-gray-500 text-sm">{driver.phone}</p>
                  </div>
                </TableCell>
                <TableCell>{driver.gender}</TableCell>
                <TableCell>{driver.createdAt}</TableCell>
                <TableCell>
                  <span
                    className={`text-sm ${driver.isVerified === true
                        ? "text-green-500"
                        : "text-red-500"
                      }`}
                  >
                    {`${driver.verificationStatus}`}
                  </span>
                </TableCell>
                <TableCell>{driver.wallet?.balance || 0}</TableCell>
                <TableCell>
                  <Switch
                    checked={!driver.isVerified}
                    onClick={async() => {
    if (driver.isVerified) {
     await changeTheDriverStatus(driver._id, false); // Toggle current status
    }else{

      await changeTheDriverStatus(driver._id, true)
    }
  }}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {/* <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button> */}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteDriver(driver._id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
