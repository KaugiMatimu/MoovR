const express = require("express");
const router = express.Router();
const { protect, isDriver } = require("../middleware/authMiddleware");
const {
  createIntercityRide,
  getIntercityRideById,
  getUserIntercityRides,
  getAvailableIntercityRides,
  acceptIntercityRide,
  updateRideStatus,
} = require("../controllers/intercityRideController");

// Create Intercity Ride
router.post("/create", protect, createIntercityRide);

// Get Intercity Ride by ID
router.get("/:rideId", protect, getIntercityRideById);

// Get Intercity Ride by ID
router.post("/accept/:rideId", protect, acceptIntercityRide);

// Update Ride Status
router.put("/status/:rideId", protect, updateRideStatus);

// Get Intercity Ride by ID
router.get("/get/available", protect, isDriver, getAvailableIntercityRides);

// Get All Intercity Rides for a User
router.get("/", protect, getUserIntercityRides);

module.exports = router;
