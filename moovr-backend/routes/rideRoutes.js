const express = require("express");
const router = express.Router();
const rideController = require("../controllers/rideController");
const { protect, isDriver, allowDriver } = require("../middleware/authMiddleware");

// Create Ride
router.post("/create", protect, rideController.createRide);

// Cancel Ride (by User)
router.post("/cancel/:rideId", protect, rideController.cancelRide);

// Get Nearby Drivers
router.get("/nearby-drivers", rideController.getNearbyDrivers);

// Accept Ride
router.post("/accept/:rideId", protect, isDriver, rideController.acceptRide);

// Reject Ride
router.post("/reject/:rideId", protect, isDriver, rideController.rejectRide);

// Update Ride Status
router.put("/status/:rideId", protect, isDriver, rideController.updateRideStatus);

// Rate Ride (by passenger)
router.post("/rate/:rideId", protect, rideController.rateRide);

// GET Rides
router.get("/available", protect, isDriver, rideController.getAvailableRides);

// GET Ride Status
router.get("/status/:rideId", protect, rideController.getRideStatus);

// Process Payment
router.post("/process-payment/:rideId", protect, rideController.processPayment);

// GET Rides by driver
router.get("/driver", protect, isDriver, rideController.getDriverRides);

// Create a share token for a ride (driver or passenger)
router.post("/share/:rideId", protect, rideController.createShareToken);

// Resolve a share token (public)
router.get("/share/public/:token", rideController.getRideByShareToken);

module.exports = router;
