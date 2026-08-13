const express = require("express");
const router = express.Router();
const {
  addReview,
  getDriverReviews,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Add a Review
router.post("/reviews", protect, addReview);

// Get Reviews for a Driver
// router.get("/reviews/:driverId", protect, getDriverReviews);

// Get Reviews for a Driver
router.get("/reviews", protect, getDriverReviews);

module.exports = router;
