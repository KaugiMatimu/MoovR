const express = require("express");
const router = express.Router();
const {
  verifyPhone,
  verifyOTP,
  registerUser,
  loginUser,
  adminLogin,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  updateProfilePicture,
  updateFCMToken,
  updateDriverAvailability,
  getAllDrivers,
  getAvailableDrivers,
  updateLocation,
  updateDriverLocation,
  updatePassengerLocation,
  shareLiveLocation,
  getPassengerLocation,
  checkUser,
  firebaseVerify,
  googleLogin,
  disableUser,
  disableDriver,
  getPendingDrivers,
  updateVerificationStatus,
  adminEditDriver,
  adminDeleteDriver,
  uploadRentalDocument,
  
} = require("../controllers/authController");
const emergencyController = require("../controllers/emergencyController");
const { protect, isDriver, allowDriver, allowAdmin } = require("../middleware/authMiddleware");
const { upload } = require("../utils/firebaseStorage"); // Import the upload middleware

// Check if user exists by phone or email
router.post("/check-user", checkUser);

// Verify Firebase ID Token
router.post("/firebase-verify", firebaseVerify);

// Google Login/Link
router.post("/google-login", googleLogin);

// Phone Verification & OTP Send
router.post("/verify-phone", verifyPhone);

// OTP Verification
router.post("/verify-otp", verifyOTP);

// Register User (after OTP verification)
router.post("/register", registerUser);

// Login User (verify OTP and login)
router.post("/login", loginUser);

// Admin Login
router.post("/admin-login", adminLogin);

// Protect the routes below with authentication middleware
router.put("/driver/availability", protect, allowDriver, updateDriverAvailability);

// Get All Drivers
router.get("/drivers/all", getAllDrivers);
router.get("/all/drivers", getAllDrivers);

// Get Available Drivers
router.get("/drivers/available", protect, getAvailableDrivers);

// Update Driver Location
// router.put("/update-location", protect, updateLocation);

// Update Driver Location
router.put("/update-location", protect, isDriver, updateDriverLocation);

// Share live location with another user
router.post("/share-live-location", protect, shareLiveLocation);

// Update Passenger Location
router.put("/update-passenger-location", protect, updatePassengerLocation);

// Get Passenger Location
router.get("/passenger-location/:userId", protect, getPassengerLocation);

// Get User
router.get("/get-user", protect, getUser);

// Update User
router.put("/update-user", protect, updateUser);
// expose contacts update via auth routes for backward compatibility
router.put("/update-emergency-contacts", protect, emergencyController.updateContacts);

router.post(
  "/upload-rental-document",
  protect,
  upload.single("file"),
  uploadRentalDocument
);

// Update FCM Token
router.put("/update-fcm-token", protect, updateFCMToken);

// Emergency assist (protected)
router.post("/emergency/assist", protect, emergencyController.emergencyAssist);

// Delete User's Account
router.delete("/delete-user", protect, deleteUser);

// Get All User
// router.get("/users", protect, getAllUsers);
// i remove the middleware bcs there is some problem in the otp so due to that reason token is not provide
router.get("/users", getAllUsers);
router.get("/all/users", getAllUsers);

// Disable/Enable User/Driver (Admin)
router.put("/disable/user", protect, allowAdmin, disableUser);
router.put("/disable/driver", protect, allowAdmin, disableDriver);

// Driver Verification (Admin)
router.get("/drivers/pending", protect, allowAdmin, getPendingDrivers);
router.put("/drivers/verify", protect, allowAdmin, updateVerificationStatus);

// Update User's Profile Pic
router.put(
  "/update-user/profile",
  protect,
  upload.single("image"), // Add the upload middleware
  updateProfilePicture
);

// Admin Driver Management
router.put("/driver/:id", protect, allowAdmin, adminEditDriver);
router.delete("/driver/:id", protect, allowAdmin, adminDeleteDriver);

module.exports = router;
