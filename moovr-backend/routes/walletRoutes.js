const express = require("express");
const router = express.Router();
const {
  addMoney,
  withdrawMoney,
  checkBalance,
  getTransactions,
  debitWallet,
  approveWithdrawal,
  getPendingWithdrawals,
  initializePayment,
  verifyPayment,
} = require("../controllers/walletController");
const { protect } = require("../middleware/authMiddleware");
const { default: axios } = require("axios");
const stripe = require("../utils/stripe");

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, userId } = req.body; // amount should be in Naira

    const amountInKobo = Math.round((parseFloat(amount) || 0) * 100);
    if (amountInKobo <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "ngn",
            product_data: {
              name: "Wallet Top Up",
            },
            unit_amount: amountInKobo,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/wallet/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/wallet`,
      metadata: {
        userId: userId,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating payment session:", error);
    res.status(500).json({ error: "Error creating payment session" });
  }
});

// Verify Stripe Session
router.get("/stripe/verify/:sessionId", protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const amount = session.amount_total / 100;
      const userId = session.metadata.userId;

      // Find or create the wallet
      const Wallet = require("../models/Wallet");
      let wallet = await Wallet.findOne({ user: req.user._id });
      if (!wallet) {
        wallet = new Wallet({ user: req.user._id, balance: 0, transactions: [] });
      }

      // Check if already processed
      const existingTxn = wallet.transactions.find(txn => txn.reference === sessionId);
      if (existingTxn) {
        return res.status(200).json({ message: "Payment already processed", wallet: wallet.balance });
      }

      wallet.balance += amount;
      wallet.transactions.push({
        type: "credit",
        amount,
        description: "Money added via Stripe",
        reference: sessionId,
        status: "approved",
        date: new Date()
      });

      await wallet.save();
      res.status(200).json({ message: "Payment verified successfully", wallet: wallet.balance });
    } else {
      res.status(400).json({ message: "Payment not completed", status: session.payment_status });
    }
  } catch (error) {
    console.error("Error verifying Stripe session:", error);
    res.status(500).json({ error: "Error verifying payment" });
  }
});







router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    console.log("Received Stripe Webhook");
    console.log("Headers:", req.headers);
    console.log("Raw Body:", req.body.toString()); // Convert Buffer to String

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("Session Completed:", session);

      const userId = session.metadata.userId;
      const amount = session.amount_total / 100;

      try {
        const Wallet = require("../models/Wallet");
        let wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
          wallet = new Wallet({ user: userId, balance: 0, transactions: [] });
        }

        // Check if already processed
        const existingTxn = wallet.transactions.find(
          (txn) => txn.reference === session.id
        );
        if (!existingTxn) {
          wallet.balance += amount;
          wallet.transactions.push({
            type: "credit",
            amount,
            description: "Money added via Stripe (Webhook)",
            reference: session.id,
            status: "approved",
            date: new Date(),
          });
          await wallet.save();
          console.log(`Wallet updated for user ${userId} via Webhook`);
        }
      } catch (err) {
        console.error("Error updating wallet in webhook:", err);
      }
    }

    res.json({ received: true });
  }
);

// Add Money to Wallet
router.post("/add", protect, addMoney);

// Withdraw Money from Wallet
router.post("/withdraw", protect, withdrawMoney);

// Withdraw Money from Wallet
router.post("/withdraw/approval", protect, approveWithdrawal);

// Withdraw Money from Wallet
router.post("/withdrawals", protect, getPendingWithdrawals);

// Check Wallet Balance
router.get("/balance", protect, checkBalance);

// Check Wallet Balance
router.get("/transactions", protect, getTransactions);

// Check Wallet Balance
router.post("/transaction", protect, debitWallet);

// Paystack Payment
router.post("/paystack/initialize", protect, initializePayment);
router.get("/paystack/verify/:reference", protect, verifyPayment);

module.exports = router;
