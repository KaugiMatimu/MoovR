const mongoose = require("mongoose");

const emergencyLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ride: { type: mongoose.Schema.Types.ObjectId, ref: "Ride" },
  coords: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
});

module.exports = mongoose.model("EmergencyLog", emergencyLogSchema);
