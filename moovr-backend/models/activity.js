const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  hide: { type: Boolean, default: false }, // Add the hide field
});

module.exports = mongoose.model("Activity", activitySchema);
