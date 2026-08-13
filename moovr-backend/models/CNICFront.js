const mongoose = require("mongoose");

const cnicFrontSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user
  imageUrl: { type: String, required: true }, // URL of the uploaded CNIC front image
  uploadedAt: { type: Date, default: Date.now } // Date when the image was uploaded
});

module.exports = mongoose.model("CNICFront", cnicFrontSchema);