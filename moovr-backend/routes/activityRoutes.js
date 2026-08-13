const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getUserActivities,
  hideActivity,
} = require("../controllers/activityController");

// Get All Activities for a User
router.get("/", protect, getUserActivities);

// Hide Activity
router.put("/hide/:activityId", protect, hideActivity);

module.exports = router;
