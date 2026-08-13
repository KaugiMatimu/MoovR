const Ride = require("../models/Ride");
const Package = require("../models/Package");
const DriverBooking = require("../models/DriverBooking");
const Reservation = require("../models/Reservation");
const IntercityRide = require("../models/IntercityRide");
const CarListing = require("../models/carListing");
// const WalletTransaction = require("../models/WalletTransaction");
const Activity = require("../models/activity");

// Get All Activities for a User
exports.getUserActivities = async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  try {
    const rides = await Ride.find({ user: userId });
    const packages = await Package.find({ user: userId });
    const driverBookings = await DriverBooking.find({ user: userId });
    const reservations = await Reservation.find({ user: userId });
    const intercityRides = await IntercityRide.find({ user: userId });
    const carListings = await CarListing.find({ user: userId });
    // const walletTransactions = await WalletTransaction.find({ user: userId });

    const activities = [
      ...rides.map((ride) => ({
        type: "ride",
        id: ride._id,
        message:
          ride.status === "completed"
            ? "Your ride has ended."
            : "Your ride has been scheduled successfully.",
        createdAt: ride.createdAt,
        status: ride.status,
        paymentType: ride.paymentType,
      })),
      ...packages.map((pkg) => ({
        type: "package",
        id: pkg._id,
        message:
          pkg.status === "delivered"
            ? "Your parcel has successfully been delivered."
            : "Your package is in transit.",
        createdAt: pkg.createdAt,
        status: pkg.status,
        paymentType: pkg.paymentType,
      })),
      ...driverBookings.map((booking) => ({
        type: "driverBooking",
        id: booking._id,
        message:
          booking.status === "completed"
            ? "Your driver booking has ended."
            : "Your driver booking is confirmed.",
        createdAt: booking.createdAt,
        status: booking.status,
        paymentType: booking.paymentMethod,
      })),
      ...reservations.map((reservation) => ({
        type: "reservation",
        id: reservation._id,
        message:
          reservation.status === "completed"
            ? "Your reservation has ended."
            : "Your reservation is confirmed.",
        createdAt: reservation.createdAt,
        status: reservation.status,
        paymentType: reservation.paymentMethod,
      })),
      ...intercityRides.map((ride) => ({
        type: "intercityRide",
        id: ride._id,
        message:
          ride.status === "completed"
            ? "Your intercity ride has ended."
            : "Your intercity ride has been scheduled successfully.",
        createdAt: ride.createdAt,
        status: ride.status,
        paymentType: ride.paymentType,
      })),
      ...carListings.map((listing) => ({
        type: "carListing",
        id: listing._id,
        message:
          listing.status === "active"
            ? "Your car listing is active."
            : "Your car listing has been updated.",
        createdAt: listing.createdAt,
        status: listing.status,
      })),
      // ...walletTransactions.map((transaction) => ({
      //   type: "walletTransaction",
      //   id: transaction._id,
      //   message:
      //     transaction.transactionType === "deposit"
      //       ? "You have successfully added cash to your wallet."
      //       : "You have successfully withdrawn cash from your wallet.",
      //   createdAt: transaction.createdAt,
      //   transactionType: transaction.transactionType,
      //   status: transaction.status,
      // })),
    ];

    // Save activities to the database
    for (const activityData of activities) {
      const existingActivity = await Activity.findOne({
        user: userId,
        id: activityData.id,
      });
      if (!existingActivity) {
        const activity = new Activity({
          user: userId,
          message: activityData.message,
          createdAt: activityData.createdAt,
        });
        await activity.save();
      }
    }

    // Fetch saved activities, sort by createdAt date in descending order, and limit to 50 results
    const savedActivities = await Activity.find({ user: userId, hide: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(savedActivities);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Hide Activity
exports.hideActivity = async (req, res) => {
  const { activityId } = req.params;

  try {
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    activity.hide = true;
    await activity.save();

    res.status(200).json({ message: "Activity hidden successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
