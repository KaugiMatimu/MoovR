const express = require("express");
const router = express.Router();
const { protect, isDriver, allowDriver } = require("../middleware/authMiddleware");
const {
  bookDriver,
  getUserBookings,
  getDriverBookings,
  getBookingById,
  getPastUserBookings,
  getPastDriverBookings,
  updateBookingStatus,
  getAllBookings,
} = require("../controllers/driverBookingController");

// Get All Bookings (Admin) - Alias for admin panel
router.get("/past/all/users/booking", getAllBookings);

// Book a Driver
router.post("/book", protect, bookDriver);

// Get Bookings for a User
router.get("/user-bookings", protect, getUserBookings);

// Get Bookings for a Driver
router.get("/driver-bookings", protect, isDriver, getDriverBookings);

// Get Booking by ID
router.get("/booking/:id", protect, getBookingById);

// Get Past Bookings for a User
router.get("/past-user-bookings", protect, getPastUserBookings);

// Get Past Bookings for a Driver
router.get("/past-driver-bookings", protect, isDriver, getPastDriverBookings);

// Update Booking Status
router.put("/booking/:id/status", protect, isDriver, updateBookingStatus);

module.exports = router;
