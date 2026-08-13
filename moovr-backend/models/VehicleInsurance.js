const mongoose = require("mongoose");

const vehicleInsuranceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  insuranceName: { type: String, required: true },
  policyNumber: { type: String, required: true },
  policyStartDate: { type: Date, required: true },
  policyExpiryDate: { type: Date, required: true },
  policyCoverage: { type: String, required: true },
  certificate: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("VehicleInsurance", vehicleInsuranceSchema);