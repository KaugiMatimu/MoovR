const Reservation = require("../models/Reservation");
const User = require("../models/User");
const { getIo } = require("../socket"); // Import the socket instance
const { notifyUser } = require("../utils/notificationService");

// Reserve a Ride
exports.reserveRide = async (req, res) => {
  const {
    pickupLocation,
    dropoffLocation,
    pickupCoordinates,
    dropoffCoordinates,
    pickupTime,
  } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const reservation = new Reservation({
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
      pickupTime,
      status: "reserved",
    });

    await reservation.save();

    const io = getIo();
    io.to(userId.toString()).emit("newReservation", reservation);

    res.status(201).json({
      message: "Ride reserved successfully",
      reservation,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Reservations
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user", "firstName lastName profilePicture phone")
      .sort({ pickupTime: 1 });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Available Reservations for Driver
exports.getAvailableReservations = async (req, res) => {
  console.log(req.user); // Log the user object to check if location is present
  const driverCoordinates = req.user.location?.coordinates; // Driver's current location

  if (!driverCoordinates) {
    return res.status(400).json({ message: "Driver location not found" });
  }

  try {
    const availableRides = await Reservation.find({
      status: "reserved", // Only fetch reservations not accepted yet
      pickupCoordinates: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: driverCoordinates,
          },
          $maxDistance: 5000, // 5km radius
        },
      },
    }).populate("user", "firstName lastName profilePicture phone");

    res.status(200).json({
      message: "Available reservations fetched successfully",
      availableRides,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching available reservations",
      error: error.message,
    });
  }
};

// Get Reservation by ID
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate(
      "user",
      "firstName lastName profilePicture phone"
    );
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Reservation
exports.updateReservation = async (req, res) => {
  try {
    const { pickupTime, status } = req.body;

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (pickupTime) reservation.pickupTime = pickupTime;
    if (status) reservation.status = status;
    reservation.updatedAt = Date.now();

    await reservation.save();

    const io = getIo();
    io.emit("reservationUpdated", reservation);

    // Notify user via multi-channel
    const user = await User.findById(reservation.user);
    await notifyUser(user, {
      event: "reservationUpdated",
      data: reservation,
      subject: `Reservation Status: ${status || "Updated"} - Moovr`,
      message: `Your reservation from ${reservation.pickupLocation} has been updated. Status: ${status || "reserved"}.`,
    });

    res.status(200).json({
      message: "Reservation updated successfully",
      reservation,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Reservation
exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const io = getIo();
    io.emit("reservationDeleted", { id: req.params.id });

    res.status(200).json({ message: "Reservation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
