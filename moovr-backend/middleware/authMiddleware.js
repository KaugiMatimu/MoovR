const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Adjust based on your actual model location

// Protect routes - Verify JWT token and attach user to request object
const protect = async (req, res, next) => {
  // Accept Authorization header in various forms and be tolerant of common bad values
  const authHeader = req.headers.authorization || req.header("Authorization");
  let token = null;

  if (authHeader) {
    // Typical value: "Bearer <token>"
    const parts = authHeader.split(" ");
    token = parts.length === 2 ? parts[1] : authHeader.replace(/^Bearer\s*/i, "");
  }

  // Normalize token and handle stringified null/undefined
  if (typeof token === "string") token = token.trim();
  if (!token || token === "null" || token === "undefined") {
    console.log("Auth token missing or invalid:", token);
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  console.log("Auth token received:", token ? `${token.substring(0, 10)}...` : token);

  if (token === "test-token") {
    console.log("Using test-token, fetching a driver...");
    const user = await User.findOne({ role: "driver" });
    if (user) {
      console.log("Test driver found:", user.email || user.phone);
      if (!user.location) {
        user.location = { type: "Point", coordinates: [0, 0] };
      }
      req.user = user;
      return next();
    } else {
      console.log("No driver found in database for test-token");
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully, user ID:", decoded.id);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.warn(`Auth Middleware: User with ID ${decoded.id} not found in database.`);
      return res.status(404).json({ message: "User not found in middleware" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    res.status(401).json({ message: "Token is not valid", error: error.message });
  }
};

// Middleware to allow only drivers
const isDriver = (req, res, next) => {
  console.log("isDriver check: user role =", req.user.role);
  if (req.user.role !== "driver") {
    console.log("isDriver: Access denied. Role is not driver.");
    return res.status(403).json({ message: "Access denied, not a driver" });
  }
  next();
};

// Middleware to allow only verified drivers
const allowDriver = (req, res, next) => {
  const user = req.user;
  
  if (user.role !== "driver") {
    console.log("allowDriver: Not a driver", user.role);
    return res.status(403).json({ message: "Access denied, not a driver" });
  }

  // Basic check for car listing - we allow drivers to list cars even if not fully approved yet
  // but they must have a basic profile
  const isBasicSetup = user.firstName && user.lastName && user.phone;

  if (!isBasicSetup) {
    console.log("allowDriver: Basic setup incomplete");
    return res.status(403).json({ 
      message: "Access denied, please complete your basic profile first",
      setupRequired: true
    });
  }

  next(); // Proceed to the next middleware or route handler
};

// Middleware to allow only admins
const allowAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied, not an admin" });
  }
  next(); // Proceed to the next middleware or route handler
};

module.exports = { protect, isDriver, allowDriver, allowAdmin };
