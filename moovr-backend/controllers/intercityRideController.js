const IntercityRide = require("../models/IntercityRide");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const stripe = require("../utils/stripe");
const paystack = require("../utils/paystack");
const { getIo } = require("../socket");
const { notifyUser } = require("../utils/notificationService");
const { calculateFare } = require("../utils/rateCalculator");
const frontendUrl = require("../utils/frontendUrl");

// Create Intercity Ride
exports.createIntercityRide = async (req, res) => {
  const {
    pickupLocation,
    dropoffLocation,
    pickupCoordinates,
    pickupPlaceId,
    dropoffCoordinates,
    dropoffPlaceId,
    distance,
    estimatedTime,
    pickupType,
    scheduleTime,
    paymentMethod,
  } = req.body;
  const userId = req.user._id;

  try {
    const fare = Number(calculateFare("intercity", distance, estimatedTime || 0));
    const commission = Number((fare * 0.15).toFixed(2)); // 15% commission for intercity
    const driverProfit = Number((fare - commission).toFixed(2));

    const intercityRide = new IntercityRide({
      user: userId,
      pickupLocation,
      dropoffLocation,
      pickupCoordinates: {
        type: "Point",
        coordinates: pickupCoordinates,
      },
      dropoffCoordinates: {
        type: "Point",
        coordinates: dropoffCoordinates,
      },
      fare,
      commission,
      driverProfit,
      distance,
      estimatedTime,
      pickupType,
      paymentMethod: paymentMethod || "Cash",
      scheduleTime: pickupType === "later" ? scheduleTime : null,
      pickupPlaceId: pickupPlaceId || null,
      dropoffPlaceId: dropoffPlaceId || null,
    });

    await intercityRide.save();

    const populatedRide = await IntercityRide.findById(intercityRide._id).populate("user", "firstName lastName profilePicture phone");

    const user = await User.findById(userId);
    if (user) {
      await notifyUser(user, {
        event: "intercityRideCreated",
        data: intercityRide,
        subject: "Intercity Ride Requested - Moovr",
        message: `Your intercity ride from ${pickupLocation} to ${dropoffLocation} has been requested. We are looking for a driver.`,
      });
    }

    const io = getIo();
    io.emit("newIntercityRide", populatedRide);

    res.status(201).json({
      message: "Intercity ride created successfully",
      intercityRide: populatedRide,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Accept Ride
exports.acceptIntercityRide = async (req, res) => {
  const { rideId } = req.params;
  const driverId = req.user._id;

  const ride = await IntercityRide.findById(rideId);
  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  console.log(ride); // Log the pickup coordinates
  if (ride.status !== "pending") {
    return res
      .status(400)
      .json({ message: "Ride is not available for acceptance" });
  }
  ride.driver = driverId;
  ride.status = "accepted";
  ride.updatedAt = Date.now();
  await ride.save();

  const populatedRide = await IntercityRide.findById(ride._id)
    .populate("user", "firstName lastName profilePicture phone")
    .populate("driver", "firstName lastName profilePicture phone");

  const driver = await User.findById(driverId);
  driver.rides.push(ride._id);
  await driver.save();
  // Emit event to notify user
  const io = getIo();
  io.to(ride.user.toString()).emit("intercityRideAccepted", populatedRide);

  // Notify user via multi-channel
  const user = await User.findById(ride.user);
  await notifyUser(user, {
    event: "intercityRideAccepted",
    data: populatedRide,
    subject: "Intercity Ride Accepted - Moovr",
    message: `Your intercity ride from ${ride.pickupLocation} to ${ride.dropoffLocation} has been accepted by ${driver.firstName}.`,
  });

  res.status(200).json({ message: "Ride accepted successfully", ride: populatedRide });
  try {
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error accepting ride", error: error.message });
  }
};

// Update Ride Status
exports.updateRideStatus = async (req, res) => {
  const { rideId } = req.params;
  const { status } = req.body;

  try {
    const ride = await IntercityRide.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    ride.status = status;
    ride.updatedAt = Date.now();
    await ride.save();

    let paymentData = {};

    // Payment Logic for Completed Intercity Rides
    if (status === "completed") {
      try {
        if (ride.paymentMethod === "MoovR Wallet") {
          const wallet = await Wallet.findOne({ user: ride.user });
          if (wallet && wallet.balance >= ride.fare) {
            wallet.balance -= ride.fare;
            wallet.transactions.push({
              type: "debit",
              amount: ride.fare,
              description: `Payment for intercity ride ${ride._id}`,
            });
            await wallet.save();

            // Credit driver's wallet
            if (ride.driver) {
              let driverWallet = await Wallet.findOne({ user: ride.driver });
              if (!driverWallet) {
                driverWallet = new Wallet({ user: ride.driver, balance: 0, transactions: [] });
              }
              driverWallet.balance += ride.driverProfit || 0;
              driverWallet.transactions.push({
                type: "credit",
                amount: ride.driverProfit || 0,
                description: `Payment for intercity ride ${ride._id} (Wallet)`,
              });
              await driverWallet.save();
            }

            paymentData = { paymentStatus: "paid", method: "Wallet" };
            ride.paymentStatus = "paid";
          } else {
            paymentData = { paymentStatus: "failed", reason: "Insufficient wallet balance" };
            ride.paymentStatus = "failed";
          }
        } else if (ride.paymentMethod === "Stripe" || ride.paymentMethod === "Debit Card" || ride.paymentMethod === "Google Pay") {
          const fareAmount = Math.round((ride.fare || 0) * 100);
          
          if (fareAmount <= 0) {
             paymentData = { paymentStatus: "paid", method: "Stripe", message: "Intercity ride fare is zero, no payment required" };
             ride.paymentStatus = "paid";
          } else {
            try {
              const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                  {
                    price_data: {
                      currency: "ngn",
                      product_data: {
                        name: `Intercity Ride - ${ride.pickupLocation} to ${ride.dropoffLocation}`,
                      },
                      unit_amount: fareAmount,
                    },
                    quantity: 1,
                  },
                ],
                mode: "payment",
                success_url: `${frontendUrl}/ride/completed?rideId=${ride._id}&payment=success`,
                cancel_url: `${frontendUrl}/ride/completed?rideId=${ride._id}&payment=cancel`,
                metadata: {
                  rideId: ride._id.toString(),
                  userId: ride.user.toString(),
                  isIntercity: true
                },
              });
              paymentData = { paymentStatus: "pending", method: "Stripe", sessionId: session.id, paymentUrl: session.url };
              ride.paymentStatus = "pending";
            } catch (stripeError) {
              console.error("Stripe Session Creation Error:", stripeError);
              paymentData = { 
                paymentStatus: "failed", 
                method: "Stripe", 
                reason: "Could not initiate Stripe payment",
                error: stripeError.message 
              };
              ride.paymentStatus = "failed";
            }
          }
        } else if (ride.paymentMethod === "Paystack") {
          const fareAmount = Math.round((ride.fare || 0) * 100);

          if (fareAmount <= 0) {
            paymentData = { paymentStatus: "paid", method: "Paystack", message: "Intercity ride fare is zero, no payment required" };
            ride.paymentStatus = "paid";
          } else {
            try {
              const user = await User.findById(ride.user);
              const response = await paystack.transaction.initialize({
                email: user.email,
                amount: fareAmount,
                metadata: {
                  rideId: ride._id.toString(),
                  userId: ride.user.toString(),
                  isIntercity: true
                },
              });
              paymentData = { 
                paymentStatus: "pending", 
                method: "Paystack", 
                authorization_url: response.data.authorization_url, 
                reference: response.data.reference 
              };
              ride.paymentStatus = "pending";
            } catch (paystackError) {
              console.error("Paystack Initialization Error:", paystackError);
              paymentData = { 
                paymentStatus: "failed", 
                method: "Paystack", 
                reason: "Could not initiate Paystack payment",
                error: paystackError.message 
              };
              ride.paymentStatus = "failed";
            }
          }
        } else if (ride.paymentMethod === "Cash") {
          if (ride.driver && ride.commission > 0) {
            let driverWallet = await Wallet.findOne({ user: ride.driver });
            if (!driverWallet) {
              driverWallet = new Wallet({ user: ride.driver, balance: 0, transactions: [] });
            }
            driverWallet.balance -= ride.commission;
            driverWallet.transactions.push({
              type: "debit",
              amount: ride.commission,
              description: `Commission for cash intercity ride ${ride._id}`,
            });
            await driverWallet.save();
          }
          paymentData = { paymentStatus: "paid", method: "Cash", message: "Cash payment processed" };
          ride.paymentStatus = "paid";
        }
        
        await ride.save();
      } catch (paymentError) {
        console.error("Intercity Ride Payment Processing Error:", paymentError);
        paymentData = { paymentStatus: "error", message: paymentError.message };
      }
    }

    // Emit event to notify user and driver
    const io = getIo();
    io.to(ride.user.toString()).emit("IntercityRideStatusUpdated", { ...ride.toObject(), ...paymentData });
    if (ride.driver) {
      io.to(ride.driver.toString()).emit("IntercityRideStatusUpdated", { ...ride.toObject(), ...paymentData });
    }

    // Notify user via multi-channel
    const user = await User.findById(ride.user);
    await notifyUser(user, {
      event: "intercityRideStatusUpdated",
      data: { ...ride.toObject(), ...paymentData },
      subject: `Intercity Ride Status: ${status} - Moovr`,
      message: `Your intercity ride status has been updated to: ${status}.`,
    });

    // Notify user to rate the driver if ride is completed
    if (status === "completed" && user) {
      await notifyUser(user, {
        event: "rateDriverPrompt",
        data: { rideId: ride._id, driverId: ride.driver, isIntercity: true },
        subject: "Rate Your Intercity Ride - Moovr",
        message: `Your intercity ride is complete! Please rate your driver to help us improve.`,
      });
    }

    res.status(200).json({ message: "Ride status updated successfully", ride, ...paymentData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating ride status", error: error.message });
  }
};

// Get Intercity Ride by ID
exports.getIntercityRideById = async (req, res) => {
  const { rideId } = req.params;

  try {
    const intercityRide = await IntercityRide.findById(rideId);

    if (!intercityRide) {
      return res.status(404).json({ message: "Intercity ride not found" });
    }

    res.status(200).json(intercityRide);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get All Intercity Rides for a User
exports.getUserIntercityRides = async (req, res) => {
  const userId = req.user._id;

  try {
    const intercityRides = await IntercityRide.find({ user: userId });

    res.status(200).json(intercityRides);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get Available Intercity Rides for Driver
exports.getAvailableIntercityRides = async (req, res) => {
  // console.log(req.user.location?.coordinates); // Log the user object to check if location is present
  // const driverCoordinates = req.user.location?.coordinates; // Driver's current location

  // if (!driverCoordinates) {
  //   return res.status(400).json({ message: "Driver location not found" });
  // }

  try {
    const availableRides = await IntercityRide.find({
      status: "pending", // Only fetch rides not accepted yet
      // pickupCoordinates: {
      //   $near: {
      //     $geometry: {
      //       type: "Point",
      //       coordinates: driverCoordinates,
      //     },
      //     $maxDistance: 5000, // 50km radius for intercity rides
      //   },
      // },
    }).populate("user", "firstName lastName profilePicture phone").sort({ createdAt: 1 });

    if (!availableRides.length) {
      return res.status(200).json({
        message: "No available intercity rides",
        availableRides: [],
      });
    }

    res.status(200).json({
      message: "Available intercity rides fetched successfully",
      availableRides,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching available why intercity rides",
      error: error.message,
    });
  }
};
