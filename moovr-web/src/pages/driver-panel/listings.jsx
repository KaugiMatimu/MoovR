import { useState, useEffect } from "react";
import { FiChevronDown, FiTrash2, FiEdit } from "react-icons/fi";
import Header from "../../components/driver-panel/header";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../utils/BaseURL";
import { toast } from "react-hot-toast";
import DeleteModal from "../../components/driver-panel/listings/deleteModal"; // Import the modal component

export default function Listings() {
  const [filter, setFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null); // Store the listing to delete

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  console.log("your token is :",token);
  if(!token){
    toast.error("token is required")
  }

  // Fetch listings from API
  useEffect(() => {
    const fetchListings = async () => {
      const userDataStr = localStorage.getItem("userData");
      if (!userDataStr) {
        toast.error("User data missing! Please login again.");
        setLoading(false);
        return;
      }
      const userData = JSON.parse(userDataStr);
      if (!userData || !userData._id) {
        toast.error("User ID missing! Please login again.");
        setLoading(false);
        return;
      }
      const driverId = userData._id;

      setLoading(true);
      try {
        const response = await axios.get(
          `${BaseURL}/cars/driver/${driverId}/cars`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setListings(response.data.cars || []);
      } catch (err) {
        setError(err.response.data.message);
        // console.log("your error is :",err);
        // console.log("your spefic err is :",err.response.data.message);
        toast.error(err.response.data.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [token]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-[#8257E9] bg-opacity-20 text-[#8257E9]";
      case "Inactive":
        return "bg-[#4C1D95] text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  // Handle Delete Listing
  const handleDelete = async () => {
    if (!listingToDelete) return;

    try {
      const response = await axios.delete(
        `${BaseURL}/cars/list/${listingToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200) throw new Error("Failed to delete listing");

      setListings((prev) =>
        prev.filter((listing) => listing._id !== listingToDelete)
      );
      toast.success("Listing deleted successfully!");
      setIsModalOpen(false); // Close the modal after deletion
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-medium">Listings</h1>

          <div className="flex items-center gap-4">
            <Link to="/d/vehicle/create">
              <button className="px-6 py-2 bg-[#8257E9] text-white rounded-full hover:bg-[#7347d5] transition-colors">
                Add New
              </button>
            </Link>

            {/* Dropdown */}
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
                  {["All", "Active", "Inactive"].map((status) => (
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
        </div>

        {/* Listings */}
        <div className="grid lg:grid-cols-2 gap-6">
          {listings
            .filter((listing) => filter === "All" || listing.status === filter)
            .map((listing) => (
              <div
                key={listing._id}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-start gap-6">
                  <div className="relative w-1/2">
                    <img
                      src={listing.image}
                      alt={listing.vehicleName}
                      className="w-full h-auto rounded-lg"
                    />
                    <span
                      className={`absolute top-2 left-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        listing.status || "Active"
                      )}`}
                    >
                      {listing.status || "Active"}
                    </span>
                  </div>

                  <div className="w-1/2 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {listing.vehicleName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {listing.make} {listing.model}
                        </p>
                      </div>
                      <p className="text-lg font-medium">₦{listing.price}</p>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-3">
                      {listing.description}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4">
                      <Link to={`/d/vehicle/edit/${listing._id}`}>
                        <button className="flex-1 px-6 py-2 bg-[#8257E9] text-white rounded-full hover:bg-[#7347d5] transition-colors flex items-center justify-center gap-2">
                          <FiEdit className="w-4 h-4" />
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          setListingToDelete(listing._id); // Set the listing to delete
                          setIsModalOpen(true); // Open the modal
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </main>

      {/* Modal */}
      <DeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
