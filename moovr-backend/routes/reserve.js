const express = require("express");
const router = express.Router();
const {
  reserveRide,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
  getAvailableReservations,
} = require("../controllers/reserveController");
const { protect } = require("../middleware/authMiddleware");

// Reserve a ride
router.post("/", protect, reserveRide);

// Get all reservations
router.get("/", getAllReservations);

// Get available reservations
router.get("/get/available", protect, getAvailableReservations);

// Get reservation by ID
router.get("/:id", protect, getReservationById);

// Update reservation
router.put("/:id", protect, updateReservation);

// Delete reservation
router.delete("/:id", protect, deleteReservation);

module.exports = router;
