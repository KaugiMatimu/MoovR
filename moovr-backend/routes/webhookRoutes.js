const express = require("express");
const router = express.Router();
const { handleStripeWebhook } = require("../controllers/webhookController");

// Stripe Webhook
router.post("/stripe", express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;