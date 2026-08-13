const mongoose = require("mongoose");
const CarListing = require("../models/carListing");
const { uploadImage } = require("../utils/firebaseStorage"); // Import firebase storage utility

exports.createCarListing = async (req, res) => {
  const { vehicleName, make, model, description, price } = req.body;
  const id = req.user._id;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Upload the file to Cloudinary
    const uploadedImage = await uploadImage(req.file.buffer);

    console.log(uploadedImage);

    const newCarListing = new CarListing({
      driverId: id,
      vehicleName,
      make,
      model,
      description,
      price,
      image: uploadedImage,
    });

    await newCarListing.save();

    res
      .status(201)
      .json({ message: "Car listing created successfully", newCarListing });
  } catch (error) {
    console.error("Server error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// exports.updateCarListing = async (req, res) => {
//   const { id } = req.params;
//   const { vehicleName, make, model, description, price } = req.body;
//   console.log(req.file);
//   try {
//     const carListing = await CarListing.findById(id);
//     // Check if car listing exists

//     if (!carListing) {
//       return res.status(404).json({ message: "Car listing not found" });
//     }

//     // Ensure the driver is the owner of the listing
//     if (carListing.driverId.toString() !== req.user._id.toString()) {
//       return res
//         .status(403)
//         .json({ message: "You can only update your own car listings" });
//     }

//     const uploadedImage = await uploadImage(req.file.buffer);

//     carListing.image = uploadedImage;

//     // Update the car listing details
//     carListing.vehicleName = vehicleName || carListing.vehicleName;
//     carListing.make = make || carListing.make;
//     carListing.model = model || carListing.model;
//     carListing.description = description || carListing.description;
//     carListing.price = price || carListing.price;
//     carListing.updatedAt = Date.now(); // Update timestamp

//     // Save the updated listing
//     await carListing.save();

//     res
//       .status(200)
//       .json({ message: "Car listing updated successfully", carListing });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };

exports.updateCarListing = async (req, res) => {
  const { id } = req.params;
  const { vehicleName, make, model, description, price, status } = req.body;

  try {
    const carListing = await CarListing.findById(id);

    // Check if car listing exists
    if (!carListing) {
      return res.status(404).json({ message: "Car listing not found" });
    }

    // Ensure the driver is the owner of the listing
    if (carListing.driverId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only update your own car listings" });
    }

    let uploadedImage = carListing.image; // Keep existing image
    if (req.file) {
      uploadedImage = await uploadImage(req.file.buffer);
    }

    // Update the car listing details
    carListing.image = uploadedImage;
    carListing.vehicleName = vehicleName || carListing.vehicleName;
    carListing.make = make || carListing.make;
    carListing.model = model || carListing.model;
    carListing.description = description || carListing.description;
    carListing.price = price || carListing.price;
    carListing.status = status || carListing.status; // Update status if provided
    carListing.updatedAt = Date.now(); // Update timestamp

    // Save the updated listing
    await carListing.save();

    res
      .status(200)
      .json({ message: "Car listing updated successfully", carListing });
  } catch (error) {
    console.error("Server error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.updateCarListingStatus = async (req, res) => {
  const { id } = req.params; // Car listing ID
  const { status } = req.body; // New status to set

  // Validate the provided status
  if (!["active", "inactive", "removed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    // Find the car listing by ID
    const carListing = await CarListing.findById(id);

    if (!carListing) {
      return res.status(404).json({ message: "Car listing not found" });
    }

    // Ensure that the driver is the owner of the listing
    if (carListing.driverId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only update your own car listings" });
    }

    // Update the status
    carListing.status = status;
    carListing.updatedAt = Date.now(); // Update the timestamp

    await carListing.save();

    res.status(200).json({
      message: "Car listing status updated successfully",
      carListing,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getActiveCars = async (req, res) => {
  try {
    // Find all car listings with 'active' status
    const activeCars = await CarListing.find({ status: "active" });

    res.status(200).json({ 
      activeCars: activeCars || [],
      cars: activeCars || [] // Alias for admin panel
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getCarListings = async (req, res) => {
  try {
    const carListings = await CarListing.find();

    const normalizedCars = (carListings || []).map((car) => {
      const hasActiveRental = (car.rentalPeriods || []).some((period) =>
        ["pending", "approved"].includes(period.status)
      );

      const isAvailable = car.status === "active" && !hasActiveRental;

      return {
        ...car.toObject(),
        isAvailable,
        availabilityStatus: isAvailable ? "Available" : "Hired",
      };
    });

    res.status(200).json({
      carListings: normalizedCars,
      cars: normalizedCars,
      availableCars: normalizedCars.filter((car) => car.isAvailable).length,
      hiredCars: normalizedCars.filter((car) => !car.isAvailable).length,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getCarListing = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    // Find the car listing by ID
    const carListing = await CarListing.findById(id);

    if (!carListing) {
      return res.status(404).json({ message: "Car listing not found" });
    }

    // Ensure that the driver is the owner of the listing
    // if (carListing.driverId.toString() !== req.user._id.toString()) {
    //   return res
    //     .status(403)
    //     .json({ message: "You can only view your own car listings" });
    // }

    res.status(200).json({ carListing });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getCarsByDriver = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid driver ID" });
  }

  const driverId = new mongoose.Types.ObjectId(id);
  console.log("Fetching cars for driver:", driverId);

  try {
    // Find cars listed by the specific driver
    const cars = await CarListing.find({ driverId });
    console.log("Found cars:", cars.length);

    res.status(200).json({ cars: cars || [] });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.deleteCarListing = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the car listing by ID
    const carListing = await CarListing.findById(id);

    if (!carListing) {
      return res.status(404).json({ message: "Car listing not found" });
    }

    // Ensure that the driver is the owner of the listing
    if (carListing.driverId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own car listings" });
    }

    // Delete the car listing
    await CarListing.findByIdAndDelete(id);

    res.status(200).json({ message: "Car listing deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
