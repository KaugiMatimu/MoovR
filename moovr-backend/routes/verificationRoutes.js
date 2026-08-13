const express = require("express");
const {
  uploadDocuments,
  acceptTerms,
} = require("../controllers/verificationController");
const { protect, isDriver } = require("../middleware/authMiddleware");
const { upload } = require("../utils/firebaseStorage");

const router = express.Router();

router.post(
  "/upload-document", // Upload documents
  protect,
  isDriver,
  upload.single("file"),
  uploadDocuments
);

router.post(
  "/accept-terms", // Accept terms
  protect,
  acceptTerms
);

module.exports = router;
