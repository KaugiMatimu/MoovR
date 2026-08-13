const { uploadImage } = require("../utils/firebaseStorage");
const User = require("../models/User");
const DrivingLicense = require("../models/DrivingLicense");
const ProofOfResidency = require("../models/ProofOfResidency");
const VehicleInsurance = require("../models/VehicleInsurance");
const VehicleRegistrationBook = require("../models/VehicleRegistrationBook");

// Upload Documents
exports.uploadDocuments = async (req, res) => {
  const {
    documentType,
    insuranceName,
    policyNumber,
    policyStartDate,
    policyExpiryDate,
    policyCoverage,
    ownerName,
    registrationNumber,
    vehicleMakeModel,
    registrationDate,
    registrationExpiryDate,
  } = req.body;
  const userId = req.user._id;

  if (
    !req.file &&
    (documentType === "drivingLicense" ||
      documentType === "proofOfResidency" ||
      documentType === "vehicleInsurance" ||
      documentType === "vehicleRegistrationBook")
  ) {
    return res.status(400).json({ message: "File is required" });
  }

  try {
    console.log("Starting uploadDocuments. documentType:", documentType);
    console.log("User ID:", userId);
    console.log("File received:", req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : "None");
    const allowedDocumentTypes = [
      "drivingLicense",
      "proofOfResidency",
      "vehicleInsurance",
      "vehicleRegistrationBook",
    ];

    if (!allowedDocumentTypes.includes(documentType)) {
      return res.status(400).json({ message: "Invalid document type" });
    }

    let documentData = {};

    if (documentType === "drivingLicense") {
      const imageUrl = await uploadImage(req.file.buffer);
      documentData = new DrivingLicense({ user: userId, imageUrl });
    } else if (documentType === "proofOfResidency") {
      const imageUrl = await uploadImage(req.file.buffer);
      documentData = new ProofOfResidency({ user: userId, imageUrl });
    } else if (documentType === "vehicleInsurance") {
      const imageUrl = await uploadImage(req.file.buffer);
      documentData = new VehicleInsurance({
        user: userId,
        insuranceName,
        policyNumber,
        policyStartDate,
        policyExpiryDate,
        policyCoverage,
        certificate: imageUrl,
      });
    } else if (documentType === "vehicleRegistrationBook") {
      const imageUrl = await uploadImage(req.file.buffer);
      documentData = new VehicleRegistrationBook({
        user: userId,
        ownerName,
        registrationNumber,
        vehicleMakeModel,
        registrationDate,
        registrationExpiryDate,
        registrationBook: imageUrl,
      });
    }

    await documentData.save();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { [`documents.${documentType}`]: documentData._id },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `${documentType} uploaded successfully`,
      documentData,
    });
  } catch (error) {
    console.error("Error in uploadDocuments:", error);
    res
      .status(500)
      .json({ message: "Error uploading document", error: error.message });
  }
};

exports.acceptTerms = async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { termsAccepted: true },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Terms and conditions accepted successfully.",
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error accepting terms and conditions",
      error: error.message,
    });
  }
};
