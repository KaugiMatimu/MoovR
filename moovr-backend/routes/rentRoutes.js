const express = require("express");
const router = express.Router();
const { protect, allowAdmin } = require("../middleware/authMiddleware");
const {
  rentCar,
  getRentalPeriods,
  getTotalRentedCarsByUser,
  getTotalRentedCars,
  getCurrentlyRentedCars,
  getRentedCarsByDriver,
  getPendingRentRequests,
  updateRentalRequestStatus,
} = require("../controllers/rentController");

// Rent a Car
router.post("/rent", protect, rentCar);

// Get Rental Periods for a Car
router.get("/rental-periods/:carId", protect, getRentalPeriods);

// Get Total Rented Cars by a Specific User
router.get("/total-rented-cars-by-user", protect, getTotalRentedCarsByUser);

// Get Total Number of Rented Cars
router.get("/total-rented-cars", protect, getTotalRentedCars);

// Get Currently Rented Cars
router.get("/currently-rented-cars", protect, getCurrentlyRentedCars);

// Get Rented Cars of a Specific Driver
router.get("/rented-cars-by-driver/:driverId", protect, getRentedCarsByDriver);

// Admin rental approval routes
router.get("/requests/pending", protect, allowAdmin, getPendingRentRequests);
router.put("/requests/:carId/:rentalId/status", protect, allowAdmin, updateRentalRequestStatus);

module.exports = router;