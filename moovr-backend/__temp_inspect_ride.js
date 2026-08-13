const mongoose = require('mongoose');
const Ride = require('./models/Ride');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const ride = await Ride.findOne().sort({ createdAt: -1 }).lean();
    console.log('LATEST_RIDE', JSON.stringify(ride ? {
      _id: ride._id,
      status: ride.status,
      fare: ride.fare,
      totalPrice: ride.totalPrice,
      pickupLocation: ride.pickupLocation,
      dropoffLocation: ride.dropoffLocation,
      driver: ride.driver,
      paymentMethod: ride.paymentMethod,
      paymentStatus: ride.paymentStatus,
      createdAt: ride.createdAt,
    } : null, null, 2));

    if (ride && ride.driver) {
      const counts = await Ride.aggregate([
        { $match: { driver: mongoose.Types.ObjectId(ride.driver) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
      console.log('DRIVER_COUNTS', JSON.stringify(counts, null, 2));
    }
  } catch (err) {
    console.error('Error querying ride:', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
