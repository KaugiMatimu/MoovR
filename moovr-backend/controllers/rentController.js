const CarListing = require("../models/carListing");
const User = require("../models/User");
const paystack = require("../utils/paystack");
const frontendUrl = require("../utils/frontendUrl");

const syncCarAvailability = (carListing) => {
  const hasActiveRental = (carListing.rentalPeriods || []).some((period) =>
    ["pending", "approved"].includes(period.status)
  );

  carListing.isAvailable = !hasActiveRental;
  return carListing;
};

// Rent a Car
exports.rentCar = async (req, res) => {
  const { carId, deliveryLocation, rentStartDate, rentEndDate, paymentMethod } = req.body;
  const userId = req.user._id;
  console.log(req.body);

  try {
    const carListing = await CarListing.findById(carId);

    if (!carListing) {
      return res.status(404).json({ message: "Car listing not found" });
    }

    const user = await User.findById(userId);
    const hasDocument = user?.rentalVerification?.passportPhoto || user?.rentalVerification?.idPhoto;
    const hasSelfie = user?.rentalVerification?.selfieWithID;
    const hasMileage = user?.rentalVerification?.driverMileagePhoto;
    const hasGasLevelPhoto = user?.rentalVerification?.gasLevelPhoto;

    if (!user || !hasDocument || !hasSelfie || !hasMileage || !hasGasLevelPhoto) {
      return res.status(400).json({
        message:
          "Please upload your passport or ID photo, selfie with ID, driver mileage photo, and a photo of the gas gauge before renting a car.",
      });
    }

    const hasActiveRental = (carListing.rentalPeriods || []).some((period) =>
      ["pending", "approved"].includes(period.status)
    );

    if (hasActiveRental) {
      return res.status(400).json({
        message: "This car is currently hired and cannot be rented again until it has been returned.",
      });
    }

    const pendingRequest = {
      startDate: new Date(rentStartDate),
      endDate: new Date(rentEndDate),
      user: userId,
      deliveryLocation,
      paymentMethod: paymentMethod || "Cash",
      status: "pending",
      createdAt: new Date(),
    };

    carListing.rentalPeriods.push(pendingRequest);
    syncCarAvailability(carListing);

    await carListing.save();

    const newRentalRequest = carListing.rentalPeriods[carListing.rentalPeriods.length - 1];

    if (paymentMethod === "Paystack") {
      const startDate = new Date(rentStartDate);
      const endDate = new Date(rentEndDate);
      const durationHours = (endDate - startDate) / (1000 * 60 * 60);
      const rentalAmount = Math.round((carListing.price || 0) * durationHours * 100);

      try {
        const paystackResponse = await paystack.transaction.initialize({
          email: user.email,
          amount: rentalAmount,
          metadata: {
            carId: carId,
            userId: userId,
            rentalRequestId: newRentalRequest._id.toString(),
            rentStartDate: rentStartDate,
            rentEndDate: rentEndDate,
            deliveryLocation: deliveryLocation,
          },
          callback_url: `${frontendUrl}/rent/car/booked`,
        });

        return res.status(200).json({
          message: "Rent request submitted. Awaiting admin approval.",
          authorization_url: paystackResponse.data.authorization_url,
          access_code: paystackResponse.data.access_code,
          reference: paystackResponse.data.reference,
          rentalRequest: newRentalRequest,
        });
      } catch (paystackError) {
        console.error("Paystack error:", paystackError);
        return res.status(500).json({
          message: "Failed to initialize Paystack payment",
          error: paystackError.message,
        });
      }
    }

    res.status(200).json({
      message: "Rent request submitted. Awaiting admin approval.",
      rentalRequest: newRentalRequest,
      carListing,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getPendingRentRequests = async (req, res) => {
  try {
    const pendingRequests = await CarListing.find({ "rentalPeriods.status": "pending" })
      .populate("rentalPeriods.user", "firstName lastName email phone")
      .lean();

    const requests = pendingRequests.flatMap((car) =>
      car.rentalPeriods
        .filter((period) => period.status === "pending")
        .map((period) => ({
          _id: period._id,
          carId: car._id,
          vehicleName: car.vehicleName,
          image: car.image,
          user: period.user,
          startDate: period.startDate,
          endDate: period.endDate,
          deliveryLocation: period.deliveryLocation,
          paymentMethod: period.paymentMethod,
          status: period.status,
        }))
    );

    res.status(200).json({ pendingRequests: requests });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.updateRentalRequestStatus = async (req, res) => {
  const { carId, rentalId } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected", "cancelled", "completed"].includes(status)) {
    return res.status(400).json({
      message: "Invalid status. Allowed values: approved, rejected, cancelled, completed.",
    });
  }

  try {
    const carListing = await CarListing.findById(carId);
    if (!carListing) {
      return res.status(404).json({ message: "Car listing not found" });
    }

    const rentalRequest = carListing.rentalPeriods.id(rentalId);
    if (!rentalRequest) {
      return res.status(404).json({ message: "Rental request not found" });
    }

    rentalRequest.status = status;

    syncCarAvailability(carListing);

    await carListing.save();

    res.status(200).json({
      message: `Rental request ${status} successfully`,
      rentalRequest,
      carListing,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get Rental Periods for a Car
exports.getRentalPeriods = async (req, res) => {
  const { carId } = req.params;

  try {
    const carListing = await CarListing.findById(carId);

    if (!carListing) {
      return res.status(404).json({ message: "Car listing not found" });
    }

    res.status(200).json({ rentalPeriods: carListing.rentalPeriods });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get Total Rented Cars by a Specific User
exports.getTotalRentedCarsByUser = async (req, res) => {
  const userId = req.user._id;

  try {
    const carListings = await CarListing.find({ "rentalPeriods.user": userId });
    const totalRentedCars = carListings.length;

    res.status(200).json({ totalRentedCars });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get Total Number of Rented Cars
exports.getTotalRentedCars = async (req, res) => {
  try {
    const carListings = await CarListing.find({
      "rentalPeriods.0": { $exists: true },
    });
    const totalRentedCars = carListings.length;

    res.status(200).json({ totalRentedCars });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get Currently Rented Cars
exports.getCurrentlyRentedCars = async (req, res) => {
  const currentDate = new Date();

  try {
    const carListings = await CarListing.find({
      rentalPeriods: {
        $elemMatch: {
          startDate: { $lte: currentDate },
          endDate: { $gte: currentDate },
        },
      },
    });

    res.status(200).json({ currentlyRentedCars: carListings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get Rented Cars of a Specific Driver
exports.getRentedCarsByDriver = async (req, res) => {
  const { driverId } = req.params;

  try {
    const carListings = await CarListing.find({
      "rentalPeriods.user": driverId,
    });

    res.status(200).json({ rentedCars: carListings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
