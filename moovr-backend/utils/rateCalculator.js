const RATES = {
  Lagos: {
    baseFare: 500,
    perMinRate: 30,
    perKmRate: 200,
    minFare: 700,
  },
  Abuja: {
    baseFare: 500,
    perMinRate: 30,
    perKmRate: 200,
    minFare: 700,
  },
  "Port Harcourt": {
    baseFare: 500,
    perMinRate: 32,
    perKmRate: 210,
    minFare: 700,
  },
  Ibadan: {
    baseFare: 450,
    perMinRate: 25,
    perKmRate: 180,
    minFare: 700,
  },
  Akure: {
    baseFare: 400,
    perMinRate: 25,
    perKmRate: 180,
    minFare: 1000,
  },
  default: {
    baseFare: 400,
    perMinRate: 25,
    perKmRate: 180,
    minFare: 700,
  },
};

/**
 * Calculates the estimated fare for a ride
 * @param {string} city - The city where the ride is taking place
 * @param {number} distance - Distance in km
 * @param {number} estimatedTime - Estimated time in minutes
 * @returns {number} - Calculated fare
 */
const calculateFare = (city, distance, estimatedTime = 0) => {
  const rates = RATES[city] || RATES.default;

  const distanceFare = distance * rates.perKmRate;
  const timeFare = estimatedTime * rates.perMinRate;
  const totalFare = rates.baseFare + distanceFare + timeFare;

  return Math.max(totalFare, rates.minFare).toFixed(2);
};

module.exports = {
  calculateFare,
  RATES,
};
