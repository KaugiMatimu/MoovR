const Package = require("../models/Package");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const stripe = require("../utils/stripe");
const paystack = require("../utils/paystack");
const { getIo } = require("../socket");
const axios = require("axios");
const { notifyUser } = require("../utils/notificationService");
const { debitWallet } = require("./walletController");
const frontendUrl = require("../utils/frontendUrl");

// Create Package
exports.createPackage = async (req, res) => {
  const {
    pickupLocation,
    dropoffLocation,
    pickupCoordinates,
    pickupPlaceId,
    dropoffCoordinates,
    dropoffPlaceId,
    packageDetails,
    paymentMethod,
  } = req.body;
  const userId = req.user._id;

  // Validate coordinates
  if (
    !Array.isArray(pickupCoordinates) ||
    !Array.isArray(dropoffCoordinates) ||
    pickupCoordinates.length !== 2 ||
    dropoffCoordinates.length !== 2 ||
    pickupCoordinates[0] < -180 ||
    pickupCoordinates[0] > 180 ||
    pickupCoordinates[1] < -90 ||
    pickupCoordinates[1] > 90 ||
    dropoffCoordinates[0] < -180 ||
    dropoffCoordinates[0] > 180 ||
    dropoffCoordinates[1] < -90 ||
    dropoffCoordinates[1] > 90
  ) {
    console.error("Invalid coordinates:", {
      pickupCoordinates,
      dropoffCoordinates,
    });
    return res.status(400).json({ message: "Invalid coordinates" });
  }

  try {
    const pkg = new Package({
      user: userId,
      pickupLocation,
      dropoffLocation,
      pickupCoordinates: {
        type: "Point",
        coordinates: [pickupCoordinates[0], pickupCoordinates[1]], // [longitude, latitude]
      },
      dropoffCoordinates: {
        type: "Point",
        coordinates: [dropoffCoordinates[0], dropoffCoordinates[1]], // [longitude, latitude]
      },
      pickupPlaceId: pickupPlaceId || null,
      dropoffPlaceId: dropoffPlaceId || null,
      packageDetails,
      paymentMethod: paymentMethod || "Cash",
    });

    // Calculate fare and distance using Google Maps Distance Matrix API
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${pickupCoordinates[1]},${pickupCoordinates[0]}&destinations=${dropoffCoordinates[1]},${dropoffCoordinates[0]}&key=${apiKey}`;

    let distance = 0;
    try {
      const response = await axios.get(url);
      if (
        response.data.rows &&
        response.data.rows[0] &&
        response.data.rows[0].elements &&
        response.data.rows[0].elements[0] &&
        response.data.rows[0].elements[0].distance
      ) {
        distance = response.data.rows[0].elements[0].distance.value / 1000; // Distance in kilometers
      } else {
        console.warn("Google Maps API returned no distance. Using fallback.");
        // Fallback: Haversine distance
        distance = calculateHaversineDistance(
          pickupCoordinates[1],
          pickupCoordinates[0],
          dropoffCoordinates[1],
          dropoffCoordinates[0]
        );
      }
    } catch (apiError) {
      console.error("Google Maps API Error:", apiError.message);
      // Fallback: Haversine distance
      distance = calculateHaversineDistance(
        pickupCoordinates[1],
        pickupCoordinates[0],
        dropoffCoordinates[1],
        dropoffCoordinates[0]
      );
    }

    console.log(`Calculated distance: ${distance} km`);
    pkg.fare = Number((distance * 100).toFixed(2)); // 100 per km
    pkg.commission = Number((pkg.fare * 0.10).toFixed(2)); // 10% commission
    pkg.driverProfit = Number((pkg.fare - pkg.commission).toFixed(2));

    // const result = await debitWallet({
    //   amount: pkg.fare,
    //   type: "debit",
    //   description: "Money Deducted for the package ride booked.",
    //   userId,
    //   // token: req.headers.authorization.split(" ")[1], // Extract the token
    // });
    // if (paymentMethod === "MoovR Wallet") {
    // }

    // console.log("Wallet debit result:", result);

    await pkg.save();

    const populatedPkg = await Package.findById(pkg._id).populate("user", "firstName lastName profilePicture phone");

    const user = await User.findById(userId);
    if (!user.packages) {
      user.packages = [];
    }
    user.packages.push(pkg._id);
    await user.save();

    // Notify user about package creation
    await notifyUser(user, {
      event: "packageCreated",
      data: pkg,
      subject: "Delivery Requested - Moovr",
      message: `Your delivery from ${pickupLocation} to ${dropoffLocation} has been requested. We are looking for a driver.`,
    });

    // Find drivers within 5km radius
    const drivers = await User.find({
      role: "driver",
      availability: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [pickupCoordinates[0], pickupCoordinates[1]], // [longitude, latitude]
          },
          $maxDistance: 5000, // 5km
        },
      },
    });

    // Emit event to notify drivers within 5km radius
    const io = getIo();
    drivers.forEach((driver) => {
      io.to(driver._id.toString()).emit("newPackage", populatedPkg);
    });

    res
      .status(201)
      .json({ message: "Package created successfully", pkg: populatedPkg, distance });
  } catch (error) {
    console.error("Error creating package:", error);
    res
      .status(500)
      .json({ message: "Error creating package", error: error.message });
  }
};

// Accept Package
exports.acceptPackage = async (req, res) => {
  const { packageId } = req.params;
  const driverId = req.user._id;

  try {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    if (pkg.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Package is not available for acceptance" });
    }

    pkg.driver = driverId;
    pkg.status = "accepted";
    pkg.updatedAt = Date.now();
    await pkg.save();

    const populatedPkg = await Package.findById(pkg._id)
      .populate("user", "firstName lastName profilePicture phone")
      .populate("driver", "firstName lastName profilePicture phone");

    const driver = await User.findById(driverId);
    if (!driver.packages) {
      driver.packages = [];
    }
    driver.packages.push(pkg._id);
    await driver.save();

    // Emit event to notify user
    const io = getIo();
    io.to(pkg.user.toString()).emit("packageAccepted", populatedPkg);

    // Notify user via multi-channel (Email, Push, Socket)
    const user = await User.findById(pkg.user);
    await notifyUser(user, {
      event: "packageAccepted",
      data: populatedPkg,
      subject: "Package Delivery Accepted - Moovr",
      message: `Your package delivery request from ${pkg.pickupLocation} has been accepted by ${driver.firstName}.`,
    });

    res.status(200).json({ message: "Package accepted successfully", pkg: populatedPkg });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error accepting package", error: error.message });
  }
};

// Update Package Status
exports.updatePackageStatus = async (req, res) => {
  const { packageId } = req.params;
  const { status } = req.body;

  try {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    pkg.status = status;
    pkg.updatedAt = Date.now();
    await pkg.save();

    let paymentData = {};

    // Payment Logic for Completed Packages
    if (status === "completed") {
      try {
        if (pkg.paymentMethod === "MoovR Wallet") {
          const wallet = await Wallet.findOne({ user: pkg.user });
          if (wallet && wallet.balance >= pkg.fare) {
            wallet.balance -= pkg.fare;
            wallet.transactions.push({
              type: "debit",
              amount: pkg.fare,
              description: `Payment for package ${pkg._id}`,
            });
            await wallet.save();

            // Credit driver's wallet
            if (pkg.driver) {
              let driverWallet = await Wallet.findOne({ user: pkg.driver });
              if (!driverWallet) {
                driverWallet = new Wallet({ user: pkg.driver, balance: 0, transactions: [] });
              }
              driverWallet.balance += pkg.driverProfit || 0;
              driverWallet.transactions.push({
                type: "credit",
                amount: pkg.driverProfit || 0,
                description: `Payment for package ${pkg._id} (Wallet)`,
              });
              await driverWallet.save();
            }

            paymentData = { paymentStatus: "paid", method: "Wallet" };
            pkg.paymentStatus = "paid";
          } else {
            paymentData = { paymentStatus: "failed", reason: "Insufficient wallet balance" };
            pkg.paymentStatus = "failed";
          }
        } else if (pkg.paymentMethod === "Stripe" || pkg.paymentMethod === "Debit Card" || pkg.paymentMethod === "Google Pay") {
          const fareAmount = Math.round((pkg.fare || 0) * 100);
          
          if (fareAmount <= 0) {
             paymentData = { paymentStatus: "paid", method: "Stripe", message: "Package fare is zero, no payment required" };
             pkg.paymentStatus = "paid";
          } else {
            try {
              const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                  {
                    price_data: {
                      currency: "ngn",
                      product_data: {
                        name: `Package Delivery - ${pkg.pickupLocation} to ${pkg.dropoffLocation}`,
                      },
                      unit_amount: fareAmount,
                    },
                    quantity: 1,
                  },
                ],
                mode: "payment",
                success_url: `${frontendUrl}/ride/completed?rideId=${pkg._id}&payment=success&isPackage=true`,
                cancel_url: `${frontendUrl}/ride/completed?rideId=${pkg._id}&payment=cancel&isPackage=true`,
                metadata: {
                  packageId: pkg._id.toString(),
                  userId: pkg.user.toString(),
                },
              });
              paymentData = { paymentStatus: "pending", method: "Stripe", sessionId: session.id, paymentUrl: session.url };
              pkg.paymentStatus = "pending";
            } catch (stripeError) {
              console.error("Stripe Session Creation Error:", stripeError);
              paymentData = { 
                paymentStatus: "failed", 
                method: "Stripe", 
                reason: "Could not initiate Stripe payment",
                error: stripeError.message 
              };
              pkg.paymentStatus = "failed";
            }
          }
        } else if (pkg.paymentMethod === "Paystack") {
          const fareAmount = Math.round((pkg.fare || 0) * 100);

          if (fareAmount <= 0) {
            paymentData = { paymentStatus: "paid", method: "Paystack", message: "Package fare is zero, no payment required" };
            pkg.paymentStatus = "paid";
          } else {
            try {
              const user = await User.findById(pkg.user);
              const response = await paystack.transaction.initialize({
                email: user.email,
                amount: fareAmount,
                metadata: {
                  packageId: pkg._id.toString(),
                  userId: pkg.user.toString(),
                  isPackage: true
                },
              });
              paymentData = { 
                paymentStatus: "pending", 
                method: "Paystack", 
                authorization_url: response.data.authorization_url, 
                reference: response.data.reference 
              };
              pkg.paymentStatus = "pending";
            } catch (paystackError) {
              console.error("Paystack Initialization Error:", paystackError);
              paymentData = { 
                paymentStatus: "failed", 
                method: "Paystack", 
                reason: "Could not initiate Paystack payment",
                error: paystackError.message 
              };
              pkg.paymentStatus = "failed";
            }
          }
        } else if (pkg.paymentMethod === "Cash") {
          if (pkg.driver && pkg.commission > 0) {
            let driverWallet = await Wallet.findOne({ user: pkg.driver });
            if (!driverWallet) {
              driverWallet = new Wallet({ user: pkg.driver, balance: 0, transactions: [] });
            }
            driverWallet.balance -= pkg.commission;
            driverWallet.transactions.push({
              type: "debit",
              amount: pkg.commission,
              description: `Commission for cash package ${pkg._id}`,
            });
            await driverWallet.save();
          }
          paymentData = { paymentStatus: "paid", method: "Cash", message: "Cash payment processed" };
          pkg.paymentStatus = "paid";
        }
        
        await pkg.save();
      } catch (paymentError) {
        console.error("Package Payment Processing Error:", paymentError);
        paymentData = { paymentStatus: "error", message: paymentError.message };
      }
    }

    // Emit event to notify user and driver
    const io = getIo();
    io.to(pkg.user.toString()).emit("packageStatusUpdated", { ...pkg.toObject(), ...paymentData });
    if (pkg.driver) {
      io.to(pkg.driver.toString()).emit("packageStatusUpdated", { ...pkg.toObject(), ...paymentData });
    }

    // Notify user via multi-channel
    const user = await User.findById(pkg.user);
    await notifyUser(user, {
      event: "packageStatusUpdated",
      data: { ...pkg.toObject(), ...paymentData },
      subject: `Package Status: ${status} - Moovr`,
      message: `Your package delivery status has been updated to: ${status}.`,
    });

    // Notify user to rate the driver if package is completed
    if (status === "completed" && user) {
      await notifyUser(user, {
        event: "rateDriverPrompt",
        data: { rideId: pkg._id, driverId: pkg.driver, isPackage: true },
        subject: "Rate Your Delivery Service - Moovr",
        message: `Your package delivery is complete! Please rate your driver to help us improve.`,
      });
    }

    res
      .status(200)
      .json({ message: "Package status updated successfully", pkg, ...paymentData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating package status", error: error.message });
  }
};

// Process Payment for Package (passenger-facing)
exports.processPackagePayment = async (req, res) => {
  const { packageId } = req.params;
  const { paymentMethod } = req.body;
  const userId = req.user._id;

  try {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    if (pkg.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to pay for this package" });
    }

    if (pkg.paymentStatus === "paid") {
      return res.status(400).json({ message: "Package is already paid" });
    }

    pkg.paymentMethod = paymentMethod || pkg.paymentMethod;
    let paymentData = {};

    try {
      if (pkg.paymentMethod === "MoovR Wallet") {
        const wallet = await Wallet.findOne({ user: pkg.user });
        if (!wallet || wallet.balance < pkg.fare) {
          return res.status(400).json({
            message: "Insufficient wallet balance. Please top up.",
            required: pkg.fare,
            balance: wallet ? wallet.balance : 0,
          });
        }

        wallet.balance -= pkg.fare;
        wallet.transactions.push({
          type: "debit",
          amount: pkg.fare,
          description: `Payment for package ${pkg._id}`,
        });
        await wallet.save();

        if (pkg.driver) {
          let driverWallet = await Wallet.findOne({ user: pkg.driver });
          if (!driverWallet) {
            driverWallet = new Wallet({ user: pkg.driver, balance: 0, transactions: [] });
          }
          driverWallet.balance += pkg.driverProfit || 0;
          driverWallet.transactions.push({
            type: "credit",
            amount: pkg.driverProfit || 0,
            description: `Payment for package ${pkg._id} (Wallet)`,
          });
          await driverWallet.save();
        }

        paymentData = { paymentStatus: "paid", method: "Wallet" };
        pkg.paymentStatus = "paid";
        pkg.status = "completed";
      } else if (pkg.paymentMethod === "Stripe" || pkg.paymentMethod === "Debit Card" || pkg.paymentMethod === "Google Pay") {
        const fareAmount = Math.round((pkg.fare || 0) * 100);

        if (fareAmount <= 0) {
          paymentData = { paymentStatus: "paid", method: "Stripe", message: "Package fare is zero, no payment required" };
          pkg.paymentStatus = "paid";
          pkg.status = "completed";
        } else {
          try {
            const session = await stripe.checkout.sessions.create({
              payment_method_types: ["card"],
              line_items: [
                {
                  price_data: {
                    currency: "ngn",
                    product_data: {
                      name: `Package Delivery - ${pkg.pickupLocation} to ${pkg.dropoffLocation}`,
                    },
                    unit_amount: fareAmount,
                  },
                  quantity: 1,
                },
              ],
              mode: "payment",
              success_url: `${frontendUrl}/ride/completed?rideId=${pkg._id}&payment=success&isPackage=true`,
              cancel_url: `${frontendUrl}/ride/completed?rideId=${pkg._id}&payment=cancel&isPackage=true`,
              metadata: {
                packageId: pkg._id.toString(),
                userId: pkg.user.toString(),
              },
            });
            paymentData = { paymentStatus: "pending", method: "Stripe", sessionId: session.id, paymentUrl: session.url };
            pkg.paymentStatus = "pending";
          } catch (stripeError) {
            console.error("Stripe Session Creation Error:", stripeError);
            paymentData = {
              paymentStatus: "failed",
              method: "Stripe",
              reason: "Could not initiate Stripe payment",
              error: stripeError.message,
            };
            pkg.paymentStatus = "failed";
          }
        }
      } else if (pkg.paymentMethod === "Paystack") {
        const fareAmount = Math.round((pkg.fare || 0) * 100);

        if (fareAmount <= 0) {
          paymentData = { paymentStatus: "paid", method: "Paystack", message: "Package fare is zero, no payment required" };
          pkg.paymentStatus = "paid";
          pkg.status = "completed";
        } else {
          try {
            const user = await User.findById(pkg.user);
            const response = await paystack.transaction.initialize({
              email: user.email,
              amount: fareAmount,
              metadata: {
                packageId: pkg._id.toString(),
                userId: pkg.user.toString(),
                isPackage: true,
              },
            });
            paymentData = {
              paymentStatus: "pending",
              method: "Paystack",
              authorization_url: response.data.authorization_url,
              reference: response.data.reference,
            };
            pkg.paymentStatus = "pending";
          } catch (paystackError) {
            console.error("Paystack Initialization Error:", paystackError);
            paymentData = {
              paymentStatus: "failed",
              method: "Paystack",
              reason: "Could not initiate Paystack payment",
              error: paystackError.message,
            };
            pkg.paymentStatus = "failed";
          }
        }
      } else if (pkg.paymentMethod === "Cash") {
        if (pkg.driver && pkg.commission > 0) {
          let driverWallet = await Wallet.findOne({ user: pkg.driver });
          if (!driverWallet) {
            driverWallet = new Wallet({ user: pkg.driver, balance: 0, transactions: [] });
          }
          driverWallet.balance -= pkg.commission;
          driverWallet.transactions.push({
            type: "debit",
            amount: pkg.commission,
            description: `Commission for cash package ${pkg._id}`,
          });
          await driverWallet.save();
        }
        paymentData = { paymentStatus: "paid", method: "Cash", message: "Cash payment processed" };
        pkg.paymentStatus = "paid";
        pkg.status = "completed";
      }

      await pkg.save();
    } catch (paymentError) {
      console.error("Package Payment Processing Error:", paymentError);
      paymentData = { paymentStatus: "error", message: paymentError.message };
    }

    const io = getIo();
    io.to(pkg.user.toString()).emit("packageStatusUpdated", { ...pkg.toObject(), ...paymentData });
    if (pkg.driver) {
      io.to(pkg.driver.toString()).emit("packageStatusUpdated", { ...pkg.toObject(), ...paymentData });
    }

    const user = await User.findById(pkg.user);
    await notifyUser(user, {
      event: "packageStatusUpdated",
      data: { ...pkg.toObject(), ...paymentData },
      subject: `Package Payment: ${pkg.paymentStatus} - Moovr`,
      message: `Your package payment status is: ${pkg.paymentStatus}.`,
    });

    res.status(200).json({ message: "Package payment processed", pkg, ...paymentData });
  } catch (error) {
    res.status(500).json({ message: "Error processing package payment", error: error.message });
  }
};

// Get Package Status
exports.getPackageStatus = async (req, res) => {
  const { packageId } = req.params;

  try {
    const pkg = await Package.findById(packageId)
      .populate("user", "firstName lastName profilePicture phone")
      .populate("driver", "firstName lastName profilePicture phone");
    
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Ensure fare is present for clients (fallback to totalPrice if present)
    const pkgObj = pkg.toObject ? pkg.toObject() : pkg;
    pkgObj.fare = pkgObj.fare !== undefined && pkgObj.fare !== null ? pkgObj.fare : (pkgObj.totalPrice || 0);

    res.status(200).json({ message: "Package status fetched successfully", pkg: pkgObj });
  } catch (error) {
    res.status(500).json({ message: "Error fetching package status", error: error.message });
  }
};

// Get Available Packages for Driver
exports.getAvailablePackages = async (req, res) => {
  const driverCoordinates = req.user.location.coordinates; // Driver's current location
  console.log(driverCoordinates);
  try {
    const availablePackages = await Package.find({
      status: "pending",
      // pickupCoordinates: {
      //   $near: {
      //     $geometry: {
      //       type: "Point",
      //       coordinates: driverCoordinates,
      //     },
      //     $maxDistance: 5000, // e.g., 5km
      //   },
      // },
    }).populate("user", "firstName lastName profilePicture phone").sort({ createdAt: 1 });

    res.status(200).json({
      message: "Available packages fetched successfully",
      availablePackages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching available packages",
      error: error.message,
    });
  }
};

// Get Current Running Package for User
exports.getCurrentRunningPackage = async (req, res) => {
  const userId = req.user._id;

  try {
    const runningPackage = await Package.findOne({
      user: userId,
      status: { $in: ["accepted", "running"] }, // Adjust based on your running statuses
    }).populate("driver", "name email"); // Populate driver info if needed

    if (!runningPackage) {
      return res
        .status(404)
        .json({ message: "No running package found for the user" });
    }

    res.status(200).json({
      message: "Running package fetched successfully",
      runningPackage,
    });
  } catch (error) {
    console.error("Error fetching running package:", error);
    res.status(500).json({
      message: "Error fetching running package",
      error: error.message,
    });
  }
};

// Helper function to calculate Haversine distance
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}
