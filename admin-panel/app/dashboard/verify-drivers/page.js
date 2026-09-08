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
import { Edit2, Trash, CheckCircle, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { BaseURL } from "@/utils/baseURL";
import { toast } from "sonner";

const documentFields = [
  { key: "drivingLicense", label: "Driving license", urlField: "imageUrl" },
  { key: "proofOfResidency", label: "Proof of residency", urlField: "imageUrl" },
  {
    key: "vehicleRegistrationBook",
    label: "Vehicle registration book",
    urlField: "registrationBook",
  },
  { key: "vehicleInsurance", label: "Vehicle insurance", urlField: "certificate" },
];

export default function VerifyDriversPage() {
  const [allDrivers, setAllDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const getAllDrivers = async () => {
    try {
      let token = localStorage.getItem("token");
      const response = await axios.get(`${BaseURL}/auth/drivers/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const drivers = response.data?.drivers || [];
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
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<Eye size={16} />}
                      onPress={() => setSelectedDriver(driver)}
                    >
                      Review documents
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      variant="shadow"
                      onPress={() => verifyDriver(driver._id)}
                    >
                      Verify
                    </Button>
                  </div>
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

      {selectedDriver && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="document-review-title"
          onClick={() => setSelectedDriver(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 id="document-review-title" className="text-2xl font-bold text-gray-800 dark:text-white">
                  {selectedDriver.firstName} {selectedDriver.lastName}&apos;s documents
                </h2>
                <p className="text-sm text-gray-500">Review the uploads before verifying this driver.</p>
              </div>
              <Button isIconOnly variant="light" aria-label="Close document review" onPress={() => setSelectedDriver(null)}>
                <span aria-hidden="true">&times;</span>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {documentFields.map(({ key, label, urlField }) => {
                const document = selectedDriver.documents?.[key];
                const documentUrl = document?.[urlField];

                return (
                  <section key={key} className="rounded-lg border p-4 dark:border-zinc-700">
                    <h3 className="mb-3 font-semibold text-gray-800 dark:text-white">{label}</h3>
                    {documentUrl ? (
                      <>
                        <a href={documentUrl} target="_blank" rel="noreferrer">
                          <img
                            src={documentUrl}
                            alt={`${label} uploaded by ${selectedDriver.firstName} ${selectedDriver.lastName}`}
                            className="h-56 w-full rounded-md border object-contain bg-gray-100 dark:bg-zinc-800"
                          />
                        </a>
                        {key === "vehicleInsurance" && (
                          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                            {document.insuranceName} · Policy {document.policyNumber}
                          </p>
                        )}
                        {key === "vehicleRegistrationBook" && (
                          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                            {document.vehicleMakeModel} · {document.registrationNumber}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">Not uploaded</p>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
