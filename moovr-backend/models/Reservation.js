const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user
  pickupLocation: { type: String, required: true }, // Pickup location for the ride
  dropoffLocation: { type: String, required: true }, // Dropoff location for the ride
  pickupCoordinates: {
    type: { type: String, enum: ["Point"], default: "Point", required: true },
    coordinates: { type: [Number], required: true },
  },
  dropoffCoordinates: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true },
  },
  pickupTime: { type: Date, required: true }, // Scheduled pickup time
  status: {
    type: String,
    enum: ["reserved", "completed", "cancelled"],
    default: "reserved",
  }, // Status of the reservation
  createdAt: { type: Date, default: Date.now }, // Date when the reservation was created
  updatedAt: { type: Date, default: Date.now }, // Date when the reservation was last updated
});

reservationSchema.index({ pickupCoordinates: "2dsphere" }); // Ensure geospatial index

module.exports = mongoose.model("Reservation", reservationSchema);
