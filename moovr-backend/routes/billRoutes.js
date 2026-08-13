const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getBills } = require("../controllers/billController");

// Get Past Rides, Packages, Driver Bookings, and Rent Bookings for a User or Driver
router.get("/", protect, getBills);

module.exports = router;
