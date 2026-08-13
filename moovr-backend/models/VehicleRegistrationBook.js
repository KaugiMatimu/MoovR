const mongoose = require("mongoose");

const vehicleRegistrationBookSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownerName: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  vehicleMakeModel: { type: String, required: true },
  registrationDate: { type: Date, required: true },
  registrationExpiryDate: { type: Date, required: true },
  registrationBook: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("VehicleRegistrationBook", vehicleRegistrationBookSchema);