const mongoose = require('mongoose');
const Ride = require('./models/Ride');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const ride = await Ride.findOne({ driver: '6a0ee786f29d67705115b702', status: { $in: ['accepted', 'running'] } }).lean();
    console.log(JSON.stringify(ride ? {
      _id: ride._id,
      status: ride.status,
      fare: ride.fare,
      paymentMethod: ride.paymentMethod,
      paymentStatus: ride.paymentStatus,
      driver: ride.driver,
      pickupLocation: ride.pickupLocation,
      dropoffLocation: ride.dropoffLocation,
    } : null, null, 2));
  } catch (err) {
    console.error('Error querying accepted/ running ride:', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
