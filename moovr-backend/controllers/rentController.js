const CarListing = require("../models/carListing");
const User = require("../models/User");
const paystack = require("../utils/paystack");
const { randomUUID } = require("crypto");

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

    // Check if the car is available for the specified period
    // Allow any date range - remove availability check
    // const isAvailable = carListing.rentalPeriods.every((period) => {
    //   return (
    //     new Date(rentStartDate) > new Date(period.endDate) ||
    //     new Date(rentEndDate) < new Date(period.startDate)
    //   );
    // });

    // if (!isAvailable) {
    //   return res
    //     .status(400)
    //     .json({ 
    //       message: "Car is not available for the specified period",
    //       existingPeriods: carListing.rentalPeriods
    //     });
    // }

    // Add the rental period to the car listing
    const rentalId = randomUUID();
    carListing.rentalPeriods = [...(carListing.rentalPeriods || []), {
      id: rentalId,
      _id: rentalId,
      startDate: new Date(rentStartDate),
      endDate: new Date(rentEndDate),
      user: userId,
      deliveryLocation,
      status: "pending",
      paymentMethod: paymentMethod || "Cash",
      createdAt: new Date(),
    }];

    carListing.isAvailable = false; // Mark the car as not available

    await carListing.save();

    // Handle Paystack payment if selected
    if (paymentMethod === "Paystack") {
      // Calculate rental duration in hours
      const startDate = new Date(rentStartDate);
      const endDate = new Date(rentEndDate);
      const durationHours = (endDate - startDate) / (1000 * 60 * 60);
      const rentalAmount = Math.round((carListing.price || 0) * durationHours * 100); // Paystack amount in kobo

      try {
        const paystackResponse = await paystack.transaction.initialize({
          email: user.email,
          amount: rentalAmount,
          metadata: {
            carId: carId,
            userId: userId,
            rentStartDate: rentStartDate,
            rentEndDate: rentEndDate,
            deliveryLocation: deliveryLocation,
          },
          callback_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/rent/car/booked`,
        });

        return res.status(200).json({
          message: "Paystack transaction initialized",
          authorization_url: paystackResponse.data.authorization_url,
          access_code: paystackResponse.data.access_code,
          reference: paystackResponse.data.reference,
        });
      } catch (paystackError) {
        console.error("Paystack error:", paystackError);
        return res.status(500).json({
          message: "Failed to initialize Paystack payment",
          error: paystackError.message,
        });
      }
    }

    res.status(200).json({ message: "Car rented successfully", carListing });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
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
    const allListings = await CarListing.find();
    const carListings = allListings.filter((listing) =>
      (listing.rentalPeriods || []).some((period) => String(period.user) === String(userId))
    );
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
    const carListings = await CarListing.find();
    const totalRentedCars = carListings.filter((listing) =>
      (listing.rentalPeriods || []).length > 0
    ).length;

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
    const allListings = await CarListing.find();
    const carListings = allListings.filter((listing) =>
      (listing.rentalPeriods || []).some((period) =>
        new Date(period.startDate) <= currentDate && new Date(period.endDate) >= currentDate
      )
    );

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
    const allListings = await CarListing.find();
    const carListings = allListings.filter((listing) =>
      (listing.rentalPeriods || []).some((period) => String(period.user) === String(driverId))
    );

    res.status(200).json({ rentedCars: carListings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getPendingRentRequests = async (req, res) => {
  try {
    const carListings = await CarListing.find()
      .populate("rentalPeriods.user", "firstName lastName");

    const pendingRequests = carListings.flatMap((carListing) =>
      carListing.rentalPeriods
        .filter((period) => period.status === "pending")
        .map((period) => ({
          ...period,
          carId: carListing._id,
          vehicleName: carListing.vehicleName,
          image: carListing.image,
        }))
    );

    res.status(200).json({ pendingRequests });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.updateRentalRequestStatus = async (req, res) => {
  const { carId, rentalId } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Status must be approved or rejected" });
  }

  try {
    const carListing = await CarListing.findById(carId);
    if (!carListing) {
      return res.status(404).json({ message: "Car listing not found" });
    }

    const rentalPeriods = carListing.rentalPeriods || [];
    const rentalIndex = rentalPeriods.findIndex((period) =>
      String(period.id || period._id) === String(rentalId)
    );
    if (rentalIndex < 0) {
      return res.status(404).json({ message: "Rental request not found" });
    }

    carListing.rentalPeriods = rentalPeriods.map((period, index) =>
      index === rentalIndex ? { ...period, status } : period
    );
    carListing.isAvailable = !carListing.rentalPeriods.some((period) =>
      ["pending", "approved"].includes(period.status)
    );

    await carListing.save();
    res.status(200).json({ message: "Rental request status updated", carListing });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
