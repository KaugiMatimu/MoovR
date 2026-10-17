const Review = require("../models/Review");
const User = require("../models/User");
const Ride = require("../models/Ride");
const moment = require("moment");

// Add a Review
exports.addReview = async (req, res) => {
  const { rating, comment, driverId, rideId } = req.body;
  const reviewerId = req.user._id;

  try {
    // Check if the reviewer is a user
    const reviewer = await User.findById(reviewerId);
    if (reviewer.role !== "user") {
      return res.status(403).json({ message: "Only users can give reviews" });
    }

    const review = new Review({
      rating,
      comment,
      reviewer: reviewerId,
      driver: driverId,
      ride: rideId,
    });

    await review.save();
    // Add the review to the driver's reviews array
    const driver = await User.findById(driverId);
    driver.reviews.push(review._id);
    await driver.save();

    // Mark the ride as rated if rideId is provided
    if (rideId) {
      await Ride.findByIdAndUpdate(rideId, { isRated: true });
    }

    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding review", error: error.message });
  }
};

// Get Reviews for a Driver
// exports.getDriverReviews = async (req, res) => {
//   const { driverId } = req.params;

//   try {
//     const driver = await User.findById(driverId).populate("reviews");
//     if (!driver) {
//       return res.status(404).json({ message: "Driver not found" });
//     }

//     const reviews = driver.reviews;
//     const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
//     const averageRating = reviews.length ? (totalRatings / reviews.length).toFixed(2) : 0;

//     // Calculate overall reviews percentage
//     const maxPossibleRating = reviews.length * 5;
//     const overallPercentage = reviews.length ? ((totalRatings / maxPossibleRating) * 100).toFixed(2) : 0;

//     // Calculate rating trend for the past 7 days
//     const ratingTrend = {};
//     for (let i = 6; i >= 0; i--) {
//       const day = moment().subtract(i, 'days').format('dddd');
//       ratingTrend[day] = reviews.filter(review => moment(review.createdAt).isSame(moment().subtract(i, 'days'), 'day')).length;
//     }

//     res.status(200).json({ reviews, averageRating, overallPercentage, ratingTrend });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error fetching reviews", error: error.message });
//   }
// };

// Get Reviews for a Driver
exports.getDriverReviews = async (req, res) => {
  const driverId = req.user.getDataValue("id");

  try {
    const driver = await User.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const reviews = await Review.find({ driver: driverId })
      .populate("reviewer", "firstName lastName profilePicture email");
    const totalRatings = reviews.reduce((sum, review) => {
      const rating = Number(review.rating);
      return sum + (Number.isFinite(rating) ? rating : 0);
    }, 0);
    const averageRating = reviews.length
      ? (totalRatings / reviews.length).toFixed(2)
      : 0;

    // Calculate overall reviews percentage
    const maxPossibleRating = reviews.length * 5;
    const overallPercentage = reviews.length
      ? ((totalRatings / maxPossibleRating) * 100).toFixed(2)
      : 0;

    // Calculate rating trend for the past 7 days
    const ratingTrend = {};
    for (let i = 6; i >= 0; i--) {
      const day = moment().subtract(i, "days").format("dddd");
      ratingTrend[day] = reviews.filter((review) =>
        moment(review.createdAt).isSame(moment().subtract(i, "days"), "day")
      ).length;
    }

    res
      .status(200)
      .json({ reviews, averageRating, overallPercentage, ratingTrend });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
};
