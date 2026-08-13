const express = require("express");
const router = express.Router();
const { protect, allowDriver, isDriver } = require("../middleware/authMiddleware");
const {
  createPackage,
  acceptPackage,
  updatePackageStatus,
  processPackagePayment,
  getAvailablePackages,
  getCurrentRunningPackage,
  getPackageStatus,
} = require("../controllers/packageController");

// Create Package
router.post("/create", protect, createPackage);

// Accept Package
// A driver should be able to accept a pending package when authenticated as a driver.
// `allowDriver` is reserved for flows requiring completed driver profile setup.
router.post("/accept/:packageId", protect, isDriver, acceptPackage);

// Update Package Status
// Package status updates should be available to authenticated drivers,
// not only drivers with a completed extra setup profile.
router.put("/status/:packageId", protect, isDriver, updatePackageStatus);

// Passenger-facing endpoint to initiate package payment (does not require driver role)
router.post("/process-payment/:packageId", protect, processPackagePayment);

// Get Package Status
router.get("/status/:packageId", protect, getPackageStatus);

router.get("/available", protect, isDriver, getAvailablePackages);

router.get("/current", protect, allowDriver, getCurrentRunningPackage);

module.exports = router;
