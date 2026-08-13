const mongoose = require("mongoose");

const driverBookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  location: { type: String, required: true },
  carName: { type: String, required: true },
  carNumber: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  commission: { type: Number, default: 0 },
  driverProfit: { type: Number, default: 0 },
  paymentMethod: { type: String, required: true },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled", "rejected"],
    default: "pending",
  },
});

module.exports = mongoose.model("DriverBooking", driverBookingSchema);
