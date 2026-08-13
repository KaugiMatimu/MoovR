const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  pickupPlaceId: { type: String },
  dropoffPlaceId: { type: String },
  pickupCoordinates: {
    type: { type: String, enum: ["Point"] },
    coordinates: { type: [Number] },
  },
  dropoffCoordinates: {
    type: { type: String, enum: ["Point"] },
    coordinates: { type: [Number] },
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "running", "completed", "cancelled", "rejected"],
    default: "pending",
  },
  fare: { type: Number },
  toll: { type: Number, default: 0 },
  commission: { type: Number, default: 0 },
  fuelCost: { type: Number, default: 0 },
  driverProfit: { type: Number, default: 0 },
  city: { type: String, default: "Lagos" },
  vehicleType: {
    type: String,
    enum: ["moovr x", "moovr mini", "moovr electric"],
    required: true,
  },
  estimatedTime: { type: Number }, // in minutes
  distance: { type: Number }, // in km
  pickupType: { type: String, enum: ["now", "later"], default: "now" },
  scheduleTime: { type: Date },
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
  isRated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

rideSchema.index({ pickupCoordinates: "2dsphere" });
rideSchema.index({ createdAt: 1 });

module.exports = mongoose.model("Ride", rideSchema);
