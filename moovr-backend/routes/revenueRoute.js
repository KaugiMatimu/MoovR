const express = require("express");
const router = express.Router();

// Middleware to verify JWT token and set user info (req.user)
const { protect, allowApprovedDriver, allowAdmin } = require("../middleware/authMiddleware");
const { getRevenue, getAdminStats } = require("../controllers/revenueController");

router.get("/", protect, allowApprovedDriver, getRevenue);
router.get("/admin-stats", protect, allowAdmin, getAdminStats);

module.exports = router;
