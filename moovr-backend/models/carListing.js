const mongoose = require("mongoose");

const carListingSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Reference to the driver
  vehicleName: { type: String, required: true }, // Name of the vehicle
  make: { type: String, required: true }, // Manufacturer of the vehicle
  model: { type: String, required: true }, // Model of the vehicle
  description: { type: String, required: true }, // Description of the vehicle
  price: { type: Number, required: true }, // Price of the vehicle
  image: { type: String, required: true }, // Image URL of the vehicle
  status: {
    type: String,
    enum: ["active", "inactive", "removed"],
    default: "inactive",
  }, // Status of the listing
  isAvailable: { type: Boolean, default: true },
  rentalPeriods: [
    {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      deliveryLocation: { type: String, required: true },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "completed", "cancelled"],
        default: "pending",
      },
      paymentMethod: { type: String, default: "Cash" },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now }, // Date when the listing was created
  updatedAt: { type: Date, default: Date.now }, // Date when the listing was last updated
});

module.exports = mongoose.model("CarListing", carListingSchema);
