const admin = require("firebase-admin");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB limit
    files: 10, // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
      cb(
        new Error("Only .jpg, .jpeg, .png, and .webp files are allowed"),
        false
      );
      return;
    }
    cb(null, true);
  },
});

const uploadImage = async (buffer) => {
  console.log("uploadImage called with buffer length:", buffer?.length);
  if (!buffer) {
    throw new Error("No buffer provided to uploadImage");
  }
  try {
    const bucket = admin.storage().bucket();
    if (!bucket.name) {
      console.error("Firebase Storage Bucket not found or not initialized.");
      throw new Error("Firebase Storage Bucket not configured");
    }
    const filename = `car-listings/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    console.log("Uploading to bucket:", bucket.name, "filename:", filename);
    const file = bucket.file(filename);

    await file.save(buffer, {
      metadata: {
        contentType: "image/jpeg",
      },
    });
    console.log("File saved successfully to Firebase Storage");

    // Try to get signed URL
    try {
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: "03-01-2500", // Far future
      });
      console.log("Signed URL generated:", url);
      return url;
    } catch (signedUrlError) {
      console.warn("Failed to generate signed URL, falling back to public URL construction:", signedUrlError.message);
      
      // Fallback: Construct public URL (this requires the bucket/file to be public or having appropriate rules)
      // For Firebase, the public URL format is:
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;
      console.log("Generated fallback URL:", publicUrl);
      return publicUrl;
    }
  } catch (error) {
    console.error("Firebase upload error:", error);
    throw error;
  }
};

module.exports = { upload, uploadImage };
