const express = require("express");
const router = express.Router();

router.use((req, res, next) => {
  console.log(`CarListingRouter: ${req.method} ${req.url}`);
  next();
});

const {
  createCarListing,
  updateCarListing,
  getCarListings,
  getCarListing,
  getCarsByDriver,
  updateCarListingStatus,
  getActiveCars,
  deleteCarListing,
} = require("../controllers/carListingController");

const { protect, isDriver, allowDriver } = require("../middleware/authMiddleware");
const { upload } = require("../utils/firebaseStorage"); // Import the upload middleware

// Create Car Listing
router.post(
  "/list",
  protect,
  isDriver,
  upload.single("file"),
  createCarListing
);

// Update Car Listing
router.put(
  "/list/:id",
  protect,
  isDriver,
  upload.single("file"),
  updateCarListing
);

// Get All Car Listings
router.get("/list", getCarListings);

// Get Single Car Listing
router.get("/list/:id", protect, getCarListing);

// Get Cars by Driver
router.get("/driver/:id/cars", getCarsByDriver);
router.get("/driver/:id", getCarsByDriver); // Fallback / alias

// Update Car Listing Status
router.put("/list/:id/status", protect, isDriver, updateCarListingStatus);

// Delete Car Listing
router.delete("/list/:id", protect, isDriver, deleteCarListing);

// Get Active Cars
router.get("/active", getActiveCars);

module.exports = router;
