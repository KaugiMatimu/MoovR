const DriverBooking = require("../models/DriverBooking");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const stripe = require("../utils/stripe");
const paystack = require("../utils/paystack");
const { notifyUser } = require("../utils/notificationService");

// Book a Driver
exports.bookDriver = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log incoming request
    console.log("Authenticated User ID:", req.user?._id); // Log userId

    const {
      driver, // Ensure this matches frontend key
      location,
      carName,
      carNumber,
      startTime,
      endTime,
      paymentMethod,
    } = req.body;

    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: "Unauthorized user" });
    if (
      !driver ||
      !location ||
      !carName ||
      !carNumber ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const driverDetails = await User.findById(driver);
    if (!driverDetails || driverDetails.role !== "driver") {
      return res.status(404).json({ message: "Driver not found" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start) || isNaN(end) || start >= end) {
      return res.status(400).json({ message: "Invalid start or end time" });
    }

    // Check overlapping bookings
    const overlappingBookings = await DriverBooking.find({
      driver,
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
        { startTime: { $lte: start }, endTime: { $gte: end } },
      ],
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        message: "Driver is already booked for the requested time period",
      });
    }

    const hours = (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours
    const totalPrice = Number((hours * driverDetails.hourlyPrice).toFixed(2));
    const commission = Number((totalPrice * 0.10).toFixed(2)); // 10% commission for driver booking
    const driverProfit = Number((totalPrice - commission).toFixed(2));

    const booking = new DriverBooking({
      user: userId,
      driver,
      location,
      carName,
      carNumber,
      startTime: start,
      endTime: end,
      totalPrice,
      commission,
      driverProfit,
      paymentMethod: paymentMethod || "Cash",
    });

    await booking.save();

    return res
      .status(201)
      .json({ message: "Driver booked successfully", booking });
  } catch (error) {
    console.error("Booking Error:", error); // Log full error
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get Bookings for a User
exports.getUserBookings = async (req, res) => {
  const userId = req.user._id;

  try {
    const bookings = await DriverBooking.find({ user: userId });

    res.status(200).json({ bookings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get Bookings for a Driver
exports.getDriverBookings = async (req, res) => {
  const driverId = req.user._id;

  try {
    const bookings = await DriverBooking.find({ driver: driverId });

    res.status(200).json({ bookings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get Booking by ID
exports.getBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await DriverBooking.findById(id).populate("user driver");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ booking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get Past Bookings for a User
exports.getPastUserBookings = async (req, res) => {
  const userId = req.user._id;
  const currentTime = new Date().getHours();

  try {
    const bookings = await DriverBooking.find({
      user: userId,
      endTime: { $lt: currentTime },
      status: { $in: ["completed", "cancelled"] },
    });

    res.status(200).json({ bookings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get Past Bookings for a Driver
exports.getPastDriverBookings = async (req, res) => {
  const driverId = req.user._id;
  const currentTime = new Date().getHours();

  try {
    const bookings = await DriverBooking.find({
      driver: driverId,
      endTime: { $lt: currentTime },
      status: { $in: ["completed", "cancelled"] },
    }).populate("user");

    res.status(200).json({ bookings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update Booking Status
exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["confirmed", "completed", "cancelled", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const booking = await DriverBooking.findById(id).populate("driver");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    let paymentData = {};

    // Payment Logic for Completed Bookings
    if (status === "completed") {
      try {
        if (booking.paymentMethod === "MoovR Wallet") {
          const wallet = await Wallet.findOne({ user: booking.user });
          if (wallet && wallet.balance >= booking.totalPrice) {
            wallet.balance -= booking.totalPrice;
            wallet.transactions.push({
              type: "debit",
              amount: booking.totalPrice,
              description: `Payment for driver booking ${booking._id}`,
            });
            await wallet.save();

            // Credit driver's wallet
            if (booking.driver) {
              let driverWallet = await Wallet.findOne({ user: booking.driver });
              if (!driverWallet) {
                driverWallet = new Wallet({ user: booking.driver, balance: 0, transactions: [] });
              }
              driverWallet.balance += booking.driverProfit || 0;
              driverWallet.transactions.push({
                type: "credit",
                amount: booking.driverProfit || 0,
                description: `Payment for driver booking ${booking._id} (Wallet)`,
              });
              await driverWallet.save();
            }

            paymentData = { paymentStatus: "paid", method: "Wallet" };
            booking.paymentStatus = "paid";
          } else {
            paymentData = { paymentStatus: "failed", reason: "Insufficient wallet balance" };
            booking.paymentStatus = "failed";
          }
        } else if (booking.paymentMethod === "Stripe" || booking.paymentMethod === "Debit Card" || booking.paymentMethod === "Google Pay") {
          const fareAmount = Math.round((booking.totalPrice || 0) * 100);
          
          if (fareAmount <= 0) {
             paymentData = { paymentStatus: "paid", method: "Stripe", message: "Booking price is zero, no payment required" };
             booking.paymentStatus = "paid";
          } else {
            try {
              const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
              const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                  {
                    price_data: {
                      currency: "ngn",
                      product_data: {
                        name: `Driver Booking - ${booking.carName}`,
                      },
                      unit_amount: fareAmount,
                    },
                    quantity: 1,
                  },
                ],
                mode: "payment",
                success_url: `${frontendUrl}/ride/completed?rideId=${booking._id}&payment=success&isBooking=true`,
                cancel_url: `${frontendUrl}/ride/completed?rideId=${booking._id}&payment=cancel&isBooking=true`,
                metadata: {
                  bookingId: booking._id.toString(),
                  userId: booking.user.toString(),
                  isBooking: true
                },
              });
              paymentData = { paymentStatus: "pending", method: "Stripe", sessionId: session.id, paymentUrl: session.url };
              booking.paymentStatus = "pending";
            } catch (stripeError) {
              console.error("Stripe Session Creation Error:", stripeError);
              paymentData = { 
                paymentStatus: "failed", 
                method: "Stripe", 
                reason: "Could not initiate Stripe payment",
                error: stripeError.message 
              };
              booking.paymentStatus = "failed";
            }
          }
        } else if (booking.paymentMethod === "Paystack") {
          const fareAmount = Math.round((booking.totalPrice || 0) * 100);

          if (fareAmount <= 0) {
            paymentData = { paymentStatus: "paid", method: "Paystack", message: "Booking price is zero, no payment required" };
            booking.paymentStatus = "paid";
          } else {
            try {
              const user = await User.findById(booking.user);
              const response = await paystack.transaction.initialize({
                email: user.email,
                amount: fareAmount,
                metadata: {
                  bookingId: booking._id.toString(),
                  userId: booking.user.toString(),
                  isBooking: true
                },
              });
              paymentData = { 
                paymentStatus: "pending", 
                method: "Paystack", 
                authorization_url: response.data.authorization_url, 
                reference: response.data.reference 
              };
              booking.paymentStatus = "pending";
            } catch (paystackError) {
              console.error("Paystack Initialization Error:", paystackError);
              paymentData = { 
                paymentStatus: "failed", 
                method: "Paystack", 
                reason: "Could not initiate Paystack payment",
                error: paystackError.message 
              };
              booking.paymentStatus = "failed";
            }
          }
        } else if (booking.paymentMethod === "Cash") {
          if (booking.driver && booking.commission > 0) {
            let driverWallet = await Wallet.findOne({ user: booking.driver });
            if (!driverWallet) {
              driverWallet = new Wallet({ user: booking.driver, balance: 0, transactions: [] });
            }
            driverWallet.balance -= booking.commission;
            driverWallet.transactions.push({
              type: "debit",
              amount: booking.commission,
              description: `Commission for cash driver booking ${booking._id}`,
            });
            await driverWallet.save();
          }
          paymentData = { paymentStatus: "paid", method: "Cash", message: "Cash payment processed" };
          booking.paymentStatus = "paid";
        }
        
        await booking.save();
      } catch (paymentError) {
        console.error("Driver Booking Payment Processing Error:", paymentError);
        paymentData = { paymentStatus: "error", message: paymentError.message };
      }
    }

    // Notify user via multi-channel
    const user = await User.findById(booking.user);
    const driverName = booking.driver ? `${booking.driver.firstName} ${booking.driver.lastName}` : "The driver";
    
    let subject = `Booking Status: ${status} - Moovr`;
    let message = `Your booking for driver services at ${booking.location} has been ${status}.`;
    
    if (status === "confirmed") {
      subject = "Booking Confirmed - Moovr";
      message = `Your booking with ${driverName} has been confirmed.`;
    } else if (status === "rejected") {
      subject = "Booking Rejected - Moovr";
      message = `Your booking request has been rejected by ${driverName}.`;
    }

    await notifyUser(user, {
      event: "bookingStatusUpdated",
      data: { ...booking.toObject(), ...paymentData },
      subject,
      message,
    });

    // Notify user to rate the driver if booking is completed
    if (status === "completed" && user) {
      await notifyUser(user, {
        event: "rateDriverPrompt",
        data: { rideId: booking._id, driverId: booking.driver?._id || booking.driver, isBooking: true },
        subject: "Rate Your Driver Service - Moovr",
        message: `Your driver service booking is complete! Please rate your driver to help us improve.`,
      });
    }

    res
      .status(200)
      .json({ message: "Booking status updated successfully", booking, ...paymentData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get All Bookings (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await DriverBooking.find().populate("user driver");
    
    // Map to format expected by admin panel
    const formattedBookings = bookings.map(b => ({
      _id: b._id,
      orderId: b._id.toString().substring(0, 8).toUpperCase(),
      customerName: b.user ? `${b.user.firstName} ${b.user.lastName}` : "Unknown",
      bookingDate: new Date(b.createdAt).toLocaleDateString(),
      paymentStatus: b.paymentStatus || "Pending",
      bookingStatus: b.status.charAt(0).toUpperCase() + b.status.slice(1),
      total: `$ ${b.totalPrice || 0}`,
      // Original data
      ...b._doc
    }));

    res.status(200).json({ 
      users: formattedBookings,
      bookings: formattedBookings // Alias for dashboard
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching all bookings", error: error.message });
  }
};
