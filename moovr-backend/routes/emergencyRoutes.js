const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const emergencyController = require("../controllers/emergencyController");

// Trigger emergency assist for a ride
router.post("/assist", protect, emergencyController.emergencyAssist);

// Get user's emergency contacts
router.get("/contacts", protect, emergencyController.getEmergencyContacts);

// Update user's emergency contacts
router.put("/contacts", protect, emergencyController.updateContacts);

module.exports = router;
