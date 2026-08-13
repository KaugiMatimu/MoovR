const Ride = require("../models/Ride");
const Package = require("../models/Package");
const DriverBooking = require("../models/DriverBooking");
const CarListing = require("../models/carListing");

// Get Past Rides, Packages, Driver Bookings, and Rent Bookings for a User or Driver
exports.getBills = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  try {
    let pastRides, pastPackages, pastDriverBookings, pastCarListings;

    if (role === "user") {
      pastRides = await Ride.find({
        user: userId,
        status: { $in: ["completed", "cancelled"] },
      });

      pastPackages = await Package.find({
        user: userId,
        status: { $in: ["delivered", "cancelled"] },
      });

      pastDriverBookings = await DriverBooking.find({
        user: userId,
        status: { $in: ["completed", "cancelled"] },
      });

      pastCarListings = await CarListing.find({
        user: userId,
        status: { $in: ["completed", "cancelled"] },
      });
    } else if (role === "driver") {
      pastRides = await Ride.find({
        driver: userId,
        status: { $in: ["completed", "cancelled"] },
      });

      pastPackages = await Package.find({
        driver: userId,
        status: { $in: ["delivered", "cancelled"] },
      });

      pastDriverBookings = await DriverBooking.find({
        driver: userId,
        status: { $in: ["completed", "cancelled"] },
      });

      pastCarListings = await CarListing.find({
        driver: userId,
        status: { $in: ["completed", "cancelled"] },
      });
    }

    const bills = [
      ...pastRides.map((ride) => ({
        type: "ride",
        id: ride._id,
        fare: ride.fare,
        createdAt: ride.createdAt,
        rating: ride.rating,
        paymentType: ride.paymentType,
      })),
      ...pastPackages.map((pkg) => ({
        type: "package",
        id: pkg._id,
        fare: pkg.fare,
        createdAt: pkg.createdAt,
        rating: pkg.rating,
        paymentType: pkg.paymentType,
      })),
      ...pastDriverBookings.map((booking) => ({
        type: "driverBooking",
        id: booking._id,
        fare: booking.totalPrice,
        createdAt: booking.createdAt,
        rating: booking.rating,
        paymentType: booking.paymentMethod,
      })),
      ...pastCarListings.map((rent) => ({
        type: "CarListing",
        id: rent._id,
        fare: rent.totalPrice,
        createdAt: rent.createdAt,
        rating: rent.rating,
        paymentType: rent.paymentMethod,
      })),
    ];

    res.status(200).json(bills);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
