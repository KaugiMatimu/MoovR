import { useEffect, useState } from "react";
import { FiUpload } from "react-icons/fi";
import Header from "../../components/driver-panel/header";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../utils/BaseURL";
import toast from "react-hot-toast";
import { DotLoader } from "react-spinners"; // Import DotLoader

export default function EditListing() {
  const { id } = useParams(); // Get ID from params
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false); // Loading state
  const [fetchingData, setFetchingData] = useState(true); // Data fetching state
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    vehicleName: "",
    make: "",
    model: "",
    description: "",
    price: "",
    status: "active", // Default status
  });

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BaseURL}/cars/list/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.carListing;
        console.log(data);
        setFormData({
          vehicleName: data.vehicleName,
          make: data.make,
          model: data.model,
          description: data.description,
          price: data.price,
          status: data.status || "active", // Set status if available
        });
        setPreviewUrl(data.image); // Assuming the API returns the image URL
      } catch (error) {
        console.error("Error fetching listing details:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch listing details."
        );
      } finally {
        setFetchingData(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file)); // Update preview
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const url = `${BaseURL}/cars/list/${id}`;
    const token = localStorage.getItem("token");

    const data = new FormData();
    data.append("vehicleName", formData.vehicleName);
    data.append("make", formData.make);
    data.append("model", formData.model);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("status", formData.status); // Add status to form data

    if (selectedImage) {
      data.append("file", selectedImage);
    }

    setLoading(true); // Start loading spinner

    try {
      await axios.put(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      toast.success("Car listing updated successfully!");
      navigate("/d/vehicle/listings"); // Redirect after update
    } catch (error) {
      console.error("Error updating the car listing:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while updating the listing."
      );
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-xl font-medium mb-8">Edit Listing</h1>

        {fetchingData ? (
          <div className="flex justify-center items-center h-96">
            <DotLoader color="#8257E9" size={60} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload Section */}
            <div
              onClick={() => document.getElementById("imageUpload")?.click()}
              className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-200 cursor-pointer relative overflow-hidden"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <>
                  <FiUpload className="w-8 h-8 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 text-center mb-1">
                    Upload media from device
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    Supported formats: JPG, JPEG, WEBP, PNG
                  </p>
                </>
              )}
              <input
                type="file"
                className="hidden"
                id="imageUpload"
                accept=".jpg,.jpeg,.webp,.png"
                onChange={handleImageUpload}
              />
            </div>

            {/* Form Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle
                  </label>
                  <input
                    type="text"
                    name="vehicleName"
                    placeholder="Vehicle"
                    value={formData.vehicleName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8257E9] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Make
                  </label>
                  <input
                    type="text"
                    name="make"
                    placeholder="Vehicle Make"
                    value={formData.make}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8257E9] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={6}
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8257E9] focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8257E9] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    placeholder="Vehicle Model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8257E9] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8257E9] focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="removed">Removed</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-primaryPurple text-white py-3 rounded-full hover:bg-[#7347d5] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8257E9]"
              >
                {loading ? <DotLoader color="#fff" size={20} /> : "Update"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
