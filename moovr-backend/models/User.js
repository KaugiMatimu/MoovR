const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: { type: String },
  email: { type: String, unique: true, sparse: true },
  password: { type: String }, // For admin or email-based login
  role: { type: String, enum: ["user", "driver", "admin"], default: "user" },
  profilePicture: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  city: { type: String },
  referralCode: { type: String },
  driverType: {
    type: String,
    enum: ["individual", "company"],
    default: null,
  },
  serviceType: {
    type: String,
    enum: ["drive", "rental", "driver", "deliver"],
    default: null,
  },
  carCategory: {
    type: String,
    enum: ["moovr x", "moovr mini", "moovr electric"],
    default: null,
  },
  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  termsAccepted: { type: Boolean, default: false },
  documents: {
    drivingLicense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DrivingLicense",
    },
    proofOfResidency: { type: mongoose.Schema.Types.ObjectId, ref: "ProofOfResidency" },
    vehicleRegistrationBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleRegistrationBook",
    },
    vehicleInsurance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleInsurance",
    },
  },
  availability: {
    type: Boolean,
    default: true,
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }], // Add reviews field
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" }, // Add wallet reference
  rides: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ride" }], // Add rides reference
  packages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Package" }], // Add packages array
  otp: { type: String },
  otpExpiry: { type: Date },
  fcmToken: { type: String }, // For Firebase Cloud Messaging
  firebaseUid: { type: String, unique: true, sparse: true },
  emergencyContacts: [
    {
      contactType: {
        type: String,
        enum: ["police", "trusted"],
        default: "trusted",
      },
      name: { type: String, default: "Trusted Contact" },
      phone: { type: String },
    },
  ],
  rentalVerification: {
    passportPhoto: { type: String, default: "" },
    idPhoto: { type: String, default: "" },
    selfieWithID: { type: String, default: "" },
    driverMileagePhoto: { type: String, default: "" },
    gasLevelPhoto: { type: String, default: "" },
    drivingLicensePhoto: { type: String, default: "" },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ["Point"], required: false }, // Set required to false initially
    coordinates: { type: [Number], required: false }, // Set required to false initially
  },
  hourlyPrice: { type: Number, default: 0 }, // Add hourly price for drivers
  // Ratings summary for drivers
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
});

userSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: "string" } } }
);

userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
