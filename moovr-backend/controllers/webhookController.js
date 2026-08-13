const stripe = require("../utils/stripe");
const crypto = require("crypto");
const Wallet = require("../models/Wallet");
const User = require("../models/User");

// Helper function to credit driver's wallet
const creditDriverWallet = async (driverId, amount, description, reference = null, paymentMethod = null) => {
  if (!driverId || amount <= 0) return;

  let driverWallet = await Wallet.findOne({ user: driverId });
  if (!driverWallet) {
    driverWallet = new Wallet({
      user: driverId,
      balance: 0,
      transactions: [],
    });
  }
  driverWallet.balance += amount;
  driverWallet.transactions.push({
    type: "credit",
    amount: amount,
    description: description,
    reference,
    paymentMethod,
    status: "approved",
  });
  await driverWallet.save();
};

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const { rideId, packageId, intercityId, bookingId, userId } = session.metadata;

      try {
        if (rideId) {
          const Ride = require("../models/Ride");
          const ride = await Ride.findById(rideId);
          if (ride && ride.paymentStatus !== "paid") {
            ride.paymentStatus = "paid";
            await ride.save();
            await creditDriverWallet(ride.driver, ride.driverProfit || 0, `Payment for ride ${ride._id} (Stripe)`);
          }
        } else if (packageId) {
          const Package = require("../models/Package");
          const pkg = await Package.findById(packageId);
          if (pkg && pkg.paymentStatus !== "paid") {
            pkg.paymentStatus = "paid";
            await pkg.save();
            await creditDriverWallet(pkg.driver, pkg.driverProfit || 0, `Payment for package ${pkg._id} (Stripe)`);
          }
        } else if (intercityId) {
          const IntercityRide = require("../models/IntercityRide");
          const ride = await IntercityRide.findById(intercityId);
          if (ride && ride.paymentStatus !== "paid") {
            ride.paymentStatus = "paid";
            await ride.save();
            await creditDriverWallet(ride.driver, ride.driverProfit || 0, `Payment for intercity ride ${ride._id} (Stripe)`);
          }
        } else if (bookingId) {
          const DriverBooking = require("../models/DriverBooking");
          const booking = await DriverBooking.findById(bookingId);
          if (booking && booking.paymentStatus !== "paid") {
            booking.paymentStatus = "paid";
            await booking.save();
            await creditDriverWallet(booking.driver, booking.driverProfit || 0, `Payment for driver booking ${booking._id} (Stripe)`);
          }
        } else if (userId) {
          // Handle wallet top-up if metadata.userId is present without other IDs
          const amount = session.amount_total / 100;
          let wallet = await Wallet.findOne({ user: userId });
          if (!wallet) {
            wallet = new Wallet({ user: userId, balance: 0, transactions: [] });
          }
          wallet.balance += amount;
          wallet.transactions.push({
            type: "credit",
            amount: amount,
            description: "Money added via Stripe Checkout",
            status: "approved",
          });
          await wallet.save();
        }
      } catch (error) {
        console.error("Stripe Webhook Error (checkout.session.completed):", error);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

exports.handlePaystackWebhook = async (req, res) => {
  const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest("hex");
  if (hash == req.headers["x-paystack-signature"]) {
    const event = req.body;
    if (event.event === "charge.success") {
      const { reference, amount, metadata, payment_method } = event.data;
      const { userId, rideId, packageId, intercityId, bookingId } = metadata;
      const actualAmount = amount / 100;

      try {
        if (rideId) {
          const Ride = require("../models/Ride");
          const ride = await Ride.findById(rideId);
          if (ride && ride.paymentStatus !== "paid") {
            ride.paymentStatus = "paid";
            await ride.save();
            await creditDriverWallet(ride.driver, ride.driverProfit || 0, `Payment for ride ${ride._id} (Paystack)`, reference, payment_method);
          }
        } else if (packageId) {
          const Package = require("../models/Package");
          const pkg = await Package.findById(packageId);
          if (pkg && pkg.paymentStatus !== "paid") {
            pkg.paymentStatus = "paid";
            await pkg.save();
            await creditDriverWallet(pkg.driver, pkg.driverProfit || 0, `Payment for package ${pkg._id} (Paystack)`, reference, payment_method);
          }
        } else if (intercityId) {
          const IntercityRide = require("../models/IntercityRide");
          const ride = await IntercityRide.findById(intercityId);
          if (ride && ride.paymentStatus !== "paid") {
            ride.paymentStatus = "paid";
            await ride.save();
            await creditDriverWallet(ride.driver, ride.driverProfit || 0, `Payment for intercity ride ${ride._id} (Paystack)`, reference, payment_method);
          }
        } else if (bookingId) {
          const DriverBooking = require("../models/DriverBooking");
          const booking = await DriverBooking.findById(bookingId);
          if (booking && booking.paymentStatus !== "paid") {
            booking.paymentStatus = "paid";
            await booking.save();
            await creditDriverWallet(booking.driver, booking.driverProfit || 0, `Payment for driver booking ${booking._id} (Paystack)`, reference, payment_method);
          }
        } else if (userId) {
          // Handle wallet top-up
          let wallet = await Wallet.findOne({ user: userId });
          if (!wallet) {
            wallet = new Wallet({ user: userId, balance: 0, transactions: [] });
          }

          // Check if this reference has already been processed
          const existingTxn = wallet.transactions.find(txn => txn.reference === reference);
          if (!existingTxn) {
            wallet.balance += actualAmount;
            wallet.transactions.push({
              type: "credit",
              amount: actualAmount,
              description: "Money added via Paystack (Webhook)",
              reference,
              paymentMethod: payment_method,
              status: "approved"
            });
            await wallet.save();
          }
        }
      } catch (error) {
        console.error("Paystack Webhook Error:", error);
        return res.sendStatus(500);
      }
    }
  }
  res.sendStatus(200);
};
