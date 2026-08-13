const express = require("express");
const router = express.Router();

// Middleware to verify JWT token and set user info (req.user)
const { protect, isDriver, allowDriver, allowAdmin } = require("../middleware/authMiddleware");
const { getRevenue, getAdminStats } = require("../controllers/revenueController");

router.get("/", protect, isDriver, getRevenue);
router.get("/admin-stats", protect, allowAdmin, getAdminStats);

module.exports = router;
