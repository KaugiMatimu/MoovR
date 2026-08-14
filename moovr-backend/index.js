// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const http = require("http");
const path = require("path");
const socket = require("./socket"); // Import the socket module
const cors = require("cors"); // Import cors
const { init } = require("./socket");
const admin = require("firebase-admin");

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, ".env") });

// Initialize Firebase Admin
const firebaseAdminConfig = (() => {
  console.log("Initializing Firebase Admin...");
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || "moovr-73876";
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;
  
  console.log("VITE_FIREBASE_PROJECT_ID from env:", process.env.VITE_FIREBASE_PROJECT_ID);
  console.log("GOOGLE_APPLICATION_CREDENTIALS from env:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

  // 1. Try FIREBASE_SERVICE_ACCOUNT (JSON string)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log("Using FIREBASE_SERVICE_ACCOUNT from env");
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      return { 
        credential: admin.credential.cert(serviceAccount),
        storageBucket: bucketName
      };
    } catch (e) {
      console.error("Error parsing FIREBASE_SERVICE_ACCOUNT env var:", e.message);
    }
  }

  // 2. Try GOOGLE_APPLICATION_CREDENTIALS (file path)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const credPath = path.isAbsolute(process.env.GOOGLE_APPLICATION_CREDENTIALS)
      ? process.env.GOOGLE_APPLICATION_CREDENTIALS
      : path.resolve(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS);
    
    console.log("Resolved Firebase credentials path:", credPath);
    
    if (require('fs').existsSync(credPath)) {
      console.log("Loading Firebase credentials from file...");
      try {
        const serviceAccount = require(credPath);
        console.log("Service account project_id:", serviceAccount.project_id);
        
        if (serviceAccount.project_id !== projectId) {
          console.warn(`CRITICAL: Project ID mismatch! Service account is for "${serviceAccount.project_id}" but VITE_FIREBASE_PROJECT_ID is "${projectId}".`);
        }
        
        return { 
          credential: admin.credential.cert(serviceAccount),
          storageBucket: bucketName
        };
      } catch (e) {
        console.error("Error loading service account file:", e.message);
      }
    } else {
      console.error("CRITICAL: Firebase service account file NOT FOUND at:", credPath);
    }
  }

  console.warn(`No service account found. Falling back to Application Default Credentials for Project ID: ${projectId}, Bucket: ${bucketName}`);
  return { 
    projectId: projectId,
    storageBucket: bucketName
  };
})();

admin.initializeApp(firebaseAdminConfig);
console.log("Firebase Admin initialized successfully.");

// Import route handlers
const userRoutes = require("./routes/userRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const carListingRoutes = require("./routes/carListingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const revenueRoutes = require("./routes/revenueRoute");
const walletRoutes = require("./routes/walletRoutes");
const rideRoutes = require("./routes/rideRoutes");
const rentRoutes = require("./routes/rentRoutes");
const packageRoutes = require("./routes/packageRoutes");
const driverBookingRoutes = require("./routes/driverBookingRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const reserveRoutes = require("./routes/reserve");
const billRoutes = require("./routes/billRoutes");
const activityRoutes = require("./routes/activityRoutes");
const intercityRideRoutes = require("./routes/intercityRideRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");

// Initialize Express app
const app = express();

// Create HTTP server and initialize Socket.io
const server = http.createServer(app);
init(server);

// Enable CORS for frontend and socket origins
const allowedOrigins = [
  "https://moovr.taxi",
  "https://www.moovr.taxi",
  "https://admin.moovr.taxi",
  "http://localhost:5173",
  "http://localhost:5175",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://moovr-admin.vercel.app", // Added common production origin pattern
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Handle Preflight (OPTIONS) Requests
app.options("*", cors(corsOptions));

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // In case form data is used

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define routes
app.use("/api/v1/bookings", driverBookingRoutes);
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/driver", verificationRoutes);
app.use("/api/v1/cars", carListingRoutes);
app.use("/api/v1", reviewRoutes);
app.use("/api/v1/revenue", revenueRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/rides", rideRoutes);
app.use("/api/v1/rent", rentRoutes);
app.use("/api/v1/package", packageRoutes);
app.use("/api/v1/webhook", webhookRoutes);
app.use("/api/v1/reserve", reserveRoutes);
app.use("/api/v1/bill", billRoutes);
app.use("/api/v1/activity", activityRoutes);
app.use("/api/v1/intercityRides", intercityRideRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/emergency", emergencyRoutes);

// Default route for the root URL
app.get("/", (req, res) => {
  res.send("Welcome to Moovr API.");
});

// Catch-all 404 handler for debugging
app.use((req, res, next) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    message: "Endpoint not found",
    method: req.method,
    url: req.url
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please kill the process using this port or use a different port.`);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
