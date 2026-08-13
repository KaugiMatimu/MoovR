"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import { Edit2, Trash, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { BaseURL } from "@/utils/baseURL";
import { toast } from "sonner";

export default function VerifyDriversPage() {
  const [allDrivers, setAllDrivers] = useState([]);

  const getAllDrivers = async () => {
    try {
      let token = localStorage.getItem("token");
      const response = await axios.get(`${BaseURL}/auth/all/drivers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const drivers = response.data?.drivers || [];
      console.log("your all drivers :",drivers);
      setAllDrivers(drivers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setAllDrivers([]);
    }
  };

  const verifyDriver = async (id) => {
    try {
      if (!id) throw new Error("Driver ID is required");
      let token = localStorage.getItem("token");

      const response = await axios.put(
        `${BaseURL}/auth/drivers/verify`,
        { id, status: "approved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const updatedDrivers = allDrivers.map((d) =>
          d._id === id
            ? { ...d, isVerified: true, verificationStatus: "Verified" }
            : d
        );
        setAllDrivers(updatedDrivers);
        toast.success("The Driver is verified successfully.");
      } else {
        throw new Error(response.data.message || "Failed to verify driver");
      }
    } catch (error) {
      console.error("Error verifying driver:", error.message);
      toast.error(
        error.response?.data?.message || error.message || "Verification failed"
      );
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
      toast.error(
        error.response?.data?.message || error.message || "Deletion failed"
      );
    }
  };

  useEffect(() => {
    getAllDrivers();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Verify Drivers</h1>
      </div>

      <div className="rounded-xl shadow border bg-white dark:bg-zinc-900 p-4">
        <Table
          aria-label="Drivers verification table"
          isStriped
          removeWrapper
          classNames={{
            table: "min-w-full",
          }}
        >
          <TableHeader>
            <TableColumn className="text-sm font-medium text-gray-500">
              DRIVER
            </TableColumn>
            <TableColumn className="text-sm font-medium text-gray-500">
              DOCUMENT STATUS
            </TableColumn>
            <TableColumn className="text-sm font-medium text-gray-500">
              ACTION
            </TableColumn>
          </TableHeader>

          <TableBody emptyContent={"No drivers found."}>
            {allDrivers.map((driver) => (
              <TableRow key={driver._id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 dark:text-white flex items-center gap-1">
                      {driver.firstName} {driver.lastName}
                      {driver.isVerified && <CheckCircle size={16} className="text-blue-500" />}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {driver.email || "No E-mail"}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  {driver.isVerified ? (
                    <Chip color="success" variant="flat" size="sm">
                      Verified
                    </Chip>
                  ) : (
                    <Button
                      size="sm"
                      color="primary"
                      variant="shadow"
                      onPress={() => verifyDriver(driver._id)}
                    >
                      Verify
                    </Button>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <Button isIconOnly size="sm" variant="light">
                      <Edit2 size={18} />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                    >
                      <Trash size={18} />
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
