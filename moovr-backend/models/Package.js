const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  pickupCoordinates: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true },
  },
  dropoffCoordinates: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true },
  },
  pickupPlaceId: { type: String },
  dropoffPlaceId: { type: String },
  packageDetails: { type: String, required: true },
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
  status: {
    type: String,
    enum: ["pending", "accepted", "running", "completed", "cancelled"],
    default: "pending",
  },
  fare: { type: Number, required: true },
  commission: { type: Number, default: 0 },
  driverProfit: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create a 2dsphere index on pickupCoordinates
packageSchema.index({ pickupCoordinates: "2dsphere" });

module.exports = mongoose.model("Package", packageSchema);
