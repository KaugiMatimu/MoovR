const mongoose = require("mongoose");

const intercityRideSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  pickupCoordinates: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number] },
  },
  dropoffCoordinates: {
    type: { type: String, enum: ["Point"] },
    coordinates: { type: [Number] },
  },
  pickupPlaceId: { type: String },
  dropoffPlaceId: { type: String },
  status: {
    type: String,
    enum: ["pending", "accepted", "running", "completed", "cancelled"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["MoovR Wallet", "Cash", "Debit Card", "Stripe", "Paystack", "Google Pay"],
    default: "Cash",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  fare: { type: Number, required: true },
  commission: { type: Number, default: 0 },
  driverProfit: { type: Number, default: 0 },
  distance: { type: Number, required: true },
  estimatedTime: { type: Number }, // in minutes
  pickupType: { type: String, enum: ["now", "later"], default: "now" },
  scheduleTime: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

intercityRideSchema.index({ pickupCoordinates: "2dsphere" }); // Ensure geospatial index

module.exports = mongoose.model("IntercityRide", intercityRideSchema);
