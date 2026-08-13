const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Ride = require("../models/Ride");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

const path = require("path");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const testPayment = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully.");

    // 1. Create Mock Passenger and Driver
    const passenger = new User({
      firstName: "Test",
      lastName: "Passenger",
      email: `passenger_${Date.now()}@test.com`,
      role: "user",
      password: "password123"
    });
    await passenger.save();

    const driver = new User({
      firstName: "Test",
      lastName: "Driver",
      email: `driver_${Date.now()}@test.com`,
      role: "driver",
      password: "password123",
      availability: true
    });
    await driver.save();

    // 2. Initialize Wallets
    const pWallet = new Wallet({ user: passenger._id, balance: 5000 });
    await pWallet.save();

    const dWallet = new Wallet({ user: driver._id, balance: 0 });
    await dWallet.save();

    console.log(`Initial Balances - Passenger: ${pWallet.balance}, Driver: ${dWallet.balance}`);

    // 3. Create a Mock Ride
    const ride = new Ride({
      user: passenger._id,
      driver: driver._id,
      pickupLocation: "Lagos Island",
      dropoffLocation: "Ikeja",
      pickupCoordinates: { type: "Point", coordinates: [3.3792, 6.4547] },
      dropoffCoordinates: { type: "Point", coordinates: [3.3333, 6.5967] },
      fare: 2000,
      commission: 300,
      driverProfit: 1500, // 2000 - 300 - some fuel cost
      vehicleType: "moovr x",
      paymentMethod: "MoovR Wallet",
      status: "running"
    });
    await ride.save();

    console.log(`Ride created with ID: ${ride._id}, Fare: ${ride.fare}, Driver Profit: ${ride.driverProfit}`);

    // 4. Simulate Wallet Payment Logic
    console.log("Simulating Wallet Payment...");
    // ... logic for wallet payment ...
    const processRidePayment = async (rideToProcess) => {
        if (rideToProcess.paymentMethod === "MoovR Wallet") {
            const wallet = await Wallet.findOne({ user: rideToProcess.user });
            if (wallet && wallet.balance >= rideToProcess.fare) {
                wallet.balance -= rideToProcess.fare;
                wallet.transactions.push({
                    type: "debit",
                    amount: rideToProcess.fare,
                    description: `Payment for ride ${rideToProcess._id}`,
                });
                await wallet.save();
                
                if (rideToProcess.driver) {
                    let driverWallet = await Wallet.findOne({ user: rideToProcess.driver });
                    if (!driverWallet) {
                        driverWallet = new Wallet({ user: rideToProcess.driver, balance: 0, transactions: [] });
                    }
                    driverWallet.balance += rideToProcess.driverProfit || 0;
                    driverWallet.transactions.push({
                        type: "credit",
                        amount: rideToProcess.driverProfit || 0,
                        description: `Payment for ride ${rideToProcess._id} (Wallet)`,
                    });
                    await driverWallet.save();
                }
                rideToProcess.paymentStatus = "paid";
                rideToProcess.status = "completed";
                await rideToProcess.save();
            }
        } else if (rideToProcess.paymentMethod === "Cash") {
            if (rideToProcess.driver && rideToProcess.commission > 0) {
                let driverWallet = await Wallet.findOne({ user: rideToProcess.driver });
                if (!driverWallet) {
                    driverWallet = new Wallet({ user: rideToProcess.driver, balance: 0, transactions: [] });
                }
                driverWallet.balance -= rideToProcess.commission;
                driverWallet.transactions.push({
                    type: "debit",
                    amount: rideToProcess.commission,
                    description: `Commission for cash ride ${rideToProcess._id}`,
                });
                await driverWallet.save();
            }
            rideToProcess.paymentStatus = "paid";
            rideToProcess.status = "completed";
            await rideToProcess.save();
        }
    };

    await processRidePayment(ride);

    // 5. Verify Results for Wallet
    let updatedPWallet = await Wallet.findOne({ user: passenger._id });
    let updatedDWallet = await Wallet.findOne({ user: driver._id });
    let updatedRide = await Ride.findById(ride._id);

    console.log("--- WALLET RESULTS ---");
    console.log(`Passenger Balance: ${updatedPWallet.balance} (Expected: 3000)`);
    console.log(`Driver Balance: ${updatedDWallet.balance} (Expected: 1500)`);
    console.log(`Ride Status: ${updatedRide.status} (Expected: completed)`);

    // 6. Test Cash Payment
    console.log("\nTesting Cash Payment...");
    const cashRide = new Ride({
        user: passenger._id,
        driver: driver._id,
        pickupLocation: "Lekki",
        dropoffLocation: "Victoria Island",
        fare: 1000,
        commission: 150,
        driverProfit: 850,
        vehicleType: "moovr mini",
        paymentMethod: "Cash",
        status: "running"
    });
    await cashRide.save();

    await processRidePayment(cashRide);

    updatedDWallet = await Wallet.findOne({ user: driver._id });
    console.log("--- CASH RESULTS ---");
    console.log(`Driver Balance: ${updatedDWallet.balance} (Expected: 1500 - 150 = 1350)`);
    console.log(`Ride Status: ${cashRide.status} (Expected: completed)`);

    // 7. Test Stripe Webhook Simulation
    console.log("\nTesting Stripe Webhook Simulation...");
    const stripeRide = new Ride({
        user: passenger._id,
        driver: driver._id,
        pickupLocation: "Airport",
        dropoffLocation: "Hotel",
        fare: 5000,
        commission: 750,
        driverProfit: 4000,
        vehicleType: "moovr x",
        paymentMethod: "Stripe",
        status: "completed",
        paymentStatus: "pending"
    });
    await stripeRide.save();

    // Mock Stripe webhook event object
    const stripeEvent = {
        type: "checkout.session.completed",
        data: {
            object: {
                metadata: {
                    rideId: stripeRide._id.toString(),
                    userId: passenger._id.toString()
                },
                amount_total: 500000 // in cents/kobo
            }
        }
    };

    // Simulate webhook logic (from webhookController.js)
    const handleStripeMock = async (event) => {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const { rideId } = session.metadata;
            if (rideId) {
                const ride = await Ride.findById(rideId);
                if (ride && ride.paymentStatus !== "paid") {
                    ride.paymentStatus = "paid";
                    await ride.save();
                    if (ride.driver) {
                        let driverWallet = await Wallet.findOne({ user: ride.driver });
                        if (!driverWallet) {
                            driverWallet = new Wallet({ user: ride.driver, balance: 0, transactions: [] });
                        }
                        driverWallet.balance += ride.driverProfit || 0;
                        driverWallet.transactions.push({
                            type: "credit",
                            amount: ride.driverProfit || 0,
                            description: `Payment for ride ${ride._id} (Stripe)`,
                            status: "approved",
                        });
                        await driverWallet.save();
                    }
                }
            }
        }
    };

    await handleStripeMock(stripeEvent);

    updatedDWallet = await Wallet.findOne({ user: driver._id });
    let updatedStripeRide = await Ride.findById(stripeRide._id);
    console.log("--- STRIPE WEBHOOK RESULTS ---");
    console.log(`Driver Balance: ${updatedDWallet.balance} (Expected: 1350 + 4000 = 5350)`);
    console.log(`Ride Payment Status: ${updatedStripeRide.paymentStatus} (Expected: paid)`);

    // 8. Test Paystack Webhook Simulation
    console.log("\nTesting Paystack Webhook Simulation...");
    const paystackRide = new Ride({
        user: passenger._id,
        driver: driver._id,
        pickupLocation: "Mall",
        dropoffLocation: "Home",
        fare: 3000,
        commission: 450,
        driverProfit: 2500,
        vehicleType: "moovr electric",
        paymentMethod: "Paystack",
        status: "completed",
        paymentStatus: "pending"
    });
    await paystackRide.save();

    // Mock Paystack webhook event
    const paystackEvent = {
        event: "charge.success",
        data: {
            reference: "pstk_" + Date.now(),
            amount: 300000,
            metadata: {
                rideId: paystackRide._id.toString(),
                userId: passenger._id.toString()
            },
            payment_method: "card"
        }
    };

    // Simulate Paystack webhook logic
    const handlePaystackMock = async (event) => {
        if (event.event === "charge.success") {
            const { reference, amount, metadata, payment_method } = event.data;
            const rideId = metadata.rideId;
            if (rideId) {
                const ride = await Ride.findById(rideId);
                if (ride && ride.paymentStatus !== "paid") {
                    ride.paymentStatus = "paid";
                    await ride.save();
                    if (ride.driver) {
                        let dWallet = await Wallet.findOne({ user: ride.driver });
                        if (!dWallet) {
                            dWallet = new Wallet({ user: ride.driver, balance: 0, transactions: [] });
                        }
                        dWallet.balance += ride.driverProfit || 0;
                        dWallet.transactions.push({
                            type: "credit",
                            amount: ride.driverProfit || 0,
                            description: `Payment for ride ${ride._id} (Paystack)`,
                            reference,
                            paymentMethod: payment_method,
                            status: "approved"
                        });
                        await dWallet.save();
                    }
                }
            }
        }
    };

    await handlePaystackMock(paystackEvent);

    updatedDWallet = await Wallet.findOne({ user: driver._id });
    let updatedPaystackRide = await Ride.findById(paystackRide._id);
    console.log("--- PAYSTACK WEBHOOK RESULTS ---");
    console.log(`Driver Balance: ${updatedDWallet.balance} (Expected: 5350 + 2500 = 7850)`);
    console.log(`Ride Payment Status: ${updatedPaystackRide.paymentStatus} (Expected: paid)`);

    // Cleanup
    // await User.findByIdAndDelete(passenger._id);
    // await User.findByIdAndDelete(driver._id);
    // await Wallet.findByIdAndDelete(pWallet._id);
    // await Wallet.findByIdAndDelete(dWallet._id);
    // await Ride.findByIdAndDelete(ride._id);

    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
};

testPayment();
