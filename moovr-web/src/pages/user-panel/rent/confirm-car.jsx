import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../../../components/user-panel/header";
import { BaseURL } from "../../../utils/BaseURL";
import axios from "axios";
import toast from "react-hot-toast";
import { DotLoader } from "react-spinners";

const ConfirmCar = () => {
  const { id } = useParams(); // Get the car ID from the URL parameters
  const location = useLocation();
  const selectedPaymentMethod = location.state?.paymentMethod || "Cash";
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [car, setCar] = useState(location.state?.car || null);
  const displayCar = location.state?.car || car || {};
  const [rentStartDate, setRentStartDate] = useState("");
  const [rentEndDate, setRentEndDate] = useState("");
  const [passportFile, setPassportFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [driverMileageFile, setDriverMileageFile] = useState(null);
  const [gasLevelFile, setGasLevelFile] = useState(null);
  const [drivingLicenseFile, setDrivingLicenseFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState({ passportPhoto: false, selfieWithID: false, driverMileagePhoto: false, gasLevelPhoto: false, drivingLicensePhoto: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Retrieve token from localStorage
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await axios.get(`${BaseURL}/cars/list/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.carListing) setCar(res.data.carListing);
      } catch (err) {
        console.error("Failed to fetch car details:", err);
      }
    };

    if (id && !location.state?.car) fetchCar();
  }, [id, token, location.state?.car]);

  const handleFileSelection = (setter, event) => {
    const file = event.target.files?.[0] || null;
    setter(file);
    event.target.value = "";
  };

  const handleUploadDocument = async (documentType, file) => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }

    if (uploading) {
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("documentType", documentType);

    try {
      const response = await axios.post(`${BaseURL}/auth/upload-rental-document`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setUploadedDocs((prev) => ({ ...prev, [documentType]: true }));
        toast.success("Document uploaded successfully.");
      } else {
        toast.error(response.data?.message || "Upload failed.");
      }
    } catch (error) {
      console.error("Document upload error:", error);
      toast.error(error.response?.data?.message || "Unable to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleRentCar = async () => {
    if (!uploadedDocs.passportPhoto || !uploadedDocs.selfieWithID || !uploadedDocs.driverMileagePhoto || !uploadedDocs.gasLevelPhoto || !uploadedDocs.drivingLicensePhoto) {
      toast.error("Please complete all required verification fields before renting.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        carId: id,
        deliveryLocation,
        rentStartDate,
        rentEndDate,
        paymentMethod: selectedPaymentMethod,
      };
      
      console.log("Sending rental request with payload:", payload);
      
      const response = await axios.post(
        `${BaseURL}/rent/rent`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Rental response:", response.data);

      if (response.data.authorization_url) {
        toast.success("Redirecting to Paystack checkout...");
        window.location.href = response.data.authorization_url;
        return;
      }

      if (response.data.message === "Car rented successfully") {
        toast.success("Car rented successfully!");
        navigate("/rent/car/booked", {
          state: {
            rental: {
              carId: id,
              carName: displayCar.vehicleName || displayCar.make,
              carImage: displayCar.image,
              deliveryLocation,
              rentStartDate,
              rentEndDate,
              paymentMethod: selectedPaymentMethod,
              price: displayCar.price,
            }
          }
        });
      } else {
        toast.error("Failed to rent the car. Please try again.");
      }
    } catch (error) {
      console.error("Error renting car:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <FaMapMarkerAlt size={23} /> Back
        </button>

        {/* Car Image Section */}
        <div className="flex justify-center mb-12">
          <div className="relative w-[600px]">
            <img
              src={car?.image || "/images/BMW.png"}
              alt={car?.vehicleName || "Car"}
              className="w-[85%] h-auto object-contain"
            />
            <div className="absolute w-full bottom-[10px] left-1/2 transform -translate-x-1/2 ">
              <img src="/images/car-surface.svg" alt="" />
            </div>
          </div>
        </div>

        {car && (
          <div className="max-w-[1180px] mx-auto mb-6 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow p-4 w-[600px] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{car.vehicleName || `${car.make} ${car.model}`}</h3>
                <p className="text-sm text-gray-600">{car.make} • {car.model}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Price / day</p>
                <p className="text-xl font-bold text-gray-900">{car.price ? `$${car.price}` : "N/A"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rent Details Section */}
        <div className="bg-white rounded-2xl shadow-md border-[1.4px] border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-3 items-end gap-6">
            {/* Delivery Location */}
            <div>
              <label className="block text-gray-500 mb-2">
                Delivery Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="Select delivery point"
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
                />
                <FaMapMarkerAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Rent Start Date/Time */}
            <div>
              <label className="block text-gray-500 mb-2">
                Rent Date and Time
              </label>
              <input
                type="datetime-local"
                value={rentStartDate}
                onChange={(e) => setRentStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>

            {/* Rent End Date/Time */}
            <div className="mt-6 md:mt-0">
              <input
                type="datetime-local"
                value={rentEndDate}
                onChange={(e) => setRentEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-4">
            <h2 className="text-lg font-semibold text-yellow-900 mb-3">
              Passport / ID verification required
            </h2>
            <p className="text-sm text-yellow-800 mb-4">
              To rent this car, please upload a clear passport or national ID photo, a selfie holding the same ID, a mileage photo, and a photo of the fuel gauge.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-purple-900">Passport / ID Photo</p>
                    <p className="text-xs text-purple-700">Upload a clear document image.</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${uploadedDocs.passportPhoto ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                    {uploadedDocs.passportPhoto ? "Uploaded" : "Pending"}
                  </span>
                </div>
                <div className="rounded-2xl border border-dashed border-purple-300 bg-white p-4 text-center">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-purple-300 bg-purple-100 px-4 py-2 text-sm font-medium text-purple-900 hover:bg-purple-200">
                    Choose file
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-3 text-xs text-gray-500">
                    {passportFile?.name ?? "No file selected"}
                  </p>
                </div>
                <button
                  onClick={() => handleUploadDocument("passportPhoto", passportFile)}
                  disabled={uploading || !passportFile}
                  className="mt-4 w-full rounded-2xl bg-purple-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {uploading ? "Uploading..." : "Upload Passport/ID"}
                </button>
              </div>

              <div className="rounded-3xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-purple-900">Selfie with ID</p>
                    <p className="text-xs text-purple-700">Take a selfie holding the same ID.</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${uploadedDocs.selfieWithID ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                    {uploadedDocs.selfieWithID ? "Uploaded" : "Pending"}
                  </span>
                </div>
                <div className="rounded-2xl border border-dashed border-purple-300 bg-white p-4 text-center">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-purple-300 bg-purple-100 px-4 py-2 text-sm font-medium text-purple-900 hover:bg-purple-200">
                    Choose file
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-3 text-xs text-gray-500">
                    {selfieFile?.name ?? "No file selected"}
                  </p>
                </div>
                <button
                  onClick={() => handleUploadDocument("selfieWithID", selfieFile)}
                  disabled={uploading || !selfieFile}
                  className="mt-4 w-full rounded-2xl bg-purple-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {uploading ? "Uploading..." : "Upload Selfie with ID"}
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-purple-200 bg-purple-50 p-5 shadow-sm md:col-span-2">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-purple-900">Driving License Photo</p>
                    <p className="text-xs text-purple-700">Upload your driving license image.</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${uploadedDocs.drivingLicensePhoto ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                    {uploadedDocs.drivingLicensePhoto ? "Uploaded" : "Pending"}
                  </span>
                </div>
                <div className="rounded-2xl border border-dashed border-purple-300 bg-white p-4 text-center">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-purple-300 bg-purple-100 px-4 py-2 text-sm font-medium text-purple-900 hover:bg-purple-200">
                    Choose file
                    <input type="file" accept="image/*" onChange={(e) => setDrivingLicenseFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  <p className="mt-3 text-xs text-gray-500">{drivingLicenseFile?.name ?? "No file selected"}</p>
                </div>
                <button onClick={() => handleUploadDocument("drivingLicensePhoto", drivingLicenseFile)} disabled={uploading || !drivingLicenseFile} className="mt-4 w-full rounded-2xl bg-purple-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300">{uploading ? "Uploading..." : "Upload Driving License"}</button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-purple-900">Driver Mileage Photo</p>
                    <p className="text-xs text-purple-700">Capture the odometer clearly.</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${uploadedDocs.driverMileagePhoto ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                    {uploadedDocs.driverMileagePhoto ? "Uploaded" : "Pending"}
                  </span>
                </div>
                <div className="rounded-2xl border border-dashed border-purple-300 bg-white p-4 text-center">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-purple-300 bg-purple-100 px-4 py-2 text-sm font-medium text-purple-900 hover:bg-purple-200">
                    Choose file
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDriverMileageFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-3 text-xs text-gray-500">
                    {driverMileageFile?.name ?? "No file selected"}
                  </p>
                </div>
                <button
                  onClick={() => handleUploadDocument("driverMileagePhoto", driverMileageFile)}
                  disabled={uploading || !driverMileageFile}
                  className="mt-4 w-full rounded-2xl bg-purple-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {uploading ? "Uploading..." : "Upload Mileage Photo"}
                </button>
              </div>

              <div className="rounded-3xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-purple-900">Fuel Gauge Photo</p>
                    <p className="text-xs text-purple-700">Show the current fuel level clearly.</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${uploadedDocs.gasLevelPhoto ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                    {uploadedDocs.gasLevelPhoto ? "Uploaded" : "Pending"}
                  </span>
                </div>
                <div className="rounded-2xl border border-dashed border-purple-300 bg-white p-4 text-center">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-purple-300 bg-purple-100 px-4 py-2 text-sm font-medium text-purple-900 hover:bg-purple-200">
                    Choose file
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setGasLevelFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-3 text-xs text-gray-500">
                    {gasLevelFile?.name ?? "No file selected"}
                  </p>
                </div>
                <button
                  onClick={() => handleUploadDocument("gasLevelPhoto", gasLevelFile)}
                  disabled={uploading || !gasLevelFile}
                  className="mt-4 w-full rounded-2xl bg-purple-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {uploading ? "Uploading..." : uploadedDocs.gasLevelPhoto ? "Uploaded" : "Upload Fuel Gauge"}
                </button>
              </div>
            </div>

          </div>

          {/* Confirm Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleRentCar}
              className="bg-purple-500 text-white py-3 px-16 rounded-full font-medium hover:bg-purple-600"
              disabled={loading}
            >
              {loading ? <DotLoader color="#ffffff" size={30} /> : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCar;
