// Import required models
const Ride = require("../models/Ride");
const User = require("../models/User");
const Package = require("../models/Package");
const DriverBooking = require("../models/DriverBooking");
const CarListing = require("../models/carListing");

// Get Revenue for a Driver by Day of Week
exports.getRevenue = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  try {
    if (role !== "driver") {
      return res
        .status(403)
        .json({ message: "Access forbidden: only drivers can view revenue" });
    }

    // Initialize revenue object for each day
    const dailyRevenue = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
      Total: 0,
    };

    // Helper function to calculate revenue and group by day
    const calculateDailyRevenue = (items) => {
      items.forEach((item) => {
        // Fallback to current date if createdAt is undefined
        const createdDate = item.createdAt || new Date();
        const day = createdDate.toLocaleString("en-US", { weekday: "long" });
        const revenue = typeof item.driverProfit === "number"
          ? item.driverProfit
          : Number(item.fare ?? item.totalPrice ?? 0);

        // Safely add to the corresponding day
        if (dailyRevenue.hasOwnProperty(day)) {
          dailyRevenue[day] += revenue;
          dailyRevenue.Total += revenue;
        }
      });
    };

    // Fetch and calculate revenue from different sources
    const pastRides = await Ride.find({
      driver: userId,
      status: { $in: ["completed", "cancelled"] },
    });
    calculateDailyRevenue(pastRides);

    const pastPackages = await Package.find({
      driver: userId,
      status: { $in: ["delivered", "cancelled"] },
    });
    calculateDailyRevenue(pastPackages);

    const pastDriverBookings = await DriverBooking.find({
      driver: userId,
      status: { $in: ["completed", "cancelled"] },
    });
    calculateDailyRevenue(pastDriverBookings);

    const pastCarListings = await CarListing.find({
      driver: userId,
      status: { $in: ["completed", "cancelled"] },
    });
    calculateDailyRevenue(pastCarListings);

    // Round all revenues to 2 decimal places
    Object.keys(dailyRevenue).forEach((key) => {
      dailyRevenue[key] = Number(dailyRevenue[key].toFixed(2));
    });

    // Return daily revenues and total revenue
    res.status(200).json({
      ...dailyRevenue,
      totalRevenue: Number(dailyRevenue.Total.toFixed(2)),
    });
  } catch (error) {
    console.error("Error calculating daily revenue:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get Admin Stats for Dashboard
exports.getAdminStats = async (req, res) => {
  try {
    const completedRides = await Ride.find({ status: "completed" });
    const completedPackages = await Package.find({ status: "completed" }); // or 'delivered' if that's the status
    const completedBookings = await DriverBooking.find({ status: "completed" });
    
    // Total Revenue (Sum of commissions)
    // For packages and bookings without commission field, we assume 10%
    // For rides with 0 commission (due to previous bug), we assume 5%
    const rideEarning = completedRides.reduce((acc, ride) => acc + (ride.commission || (ride.fare * 0.05) || 0), 0);
    const packageEarning = completedPackages.reduce((acc, pkg) => acc + (pkg.commission || (pkg.fare * 0.10) || 0), 0);
    const bookingEarning = completedBookings.reduce((acc, booking) => acc + (booking.commission || (booking.totalPrice * 0.10) || 0), 0);
    
    const totalEarning = rideEarning + packageEarning + bookingEarning;
    
    // Today's Earning
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRides = completedRides.filter(r => r.updatedAt >= today);
    const todayPackages = completedPackages.filter(p => p.updatedAt >= today);
    const todayBookings = completedBookings.filter(b => b.updatedAt >= today);
    
    const todayRideEarning = todayRides.reduce((acc, ride) => acc + (ride.commission || (ride.fare * 0.05) || 0), 0);
    const todayPackageEarning = todayPackages.reduce((acc, pkg) => acc + (pkg.commission || (pkg.fare * 0.10) || 0), 0);
    const todayBookingEarning = todayBookings.reduce((acc, booking) => acc + (booking.commission || (booking.totalPrice * 0.10) || 0), 0);
    
    const todayEarning = todayRideEarning + todayPackageEarning + todayBookingEarning;

    const totalUsers = await User.countDocuments({ role: "user" });
    const totalDrivers = await User.countDocuments({ role: "driver" });
    const pendingDrivers = await User.countDocuments({ role: "driver", verificationStatus: "pending" });
    const totalRides = completedRides.length;

    res.status(200).json({
      success: true,
      stats: {
        totalEarning: totalEarning.toFixed(2),
        todayEarning: todayEarning.toFixed(2),
        totalUsers,
        totalDrivers,
        pendingDrivers,
        totalRides
      }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
