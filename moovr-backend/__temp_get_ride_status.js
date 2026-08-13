const axios = require('axios');
const rideId = '6a65bc942664815da44e9ba7';
(async () => {
  try {
    const response = await axios.get(`http://localhost:5000/api/v1/rides/status/${rideId}`, {
      headers: { Authorization: 'Bearer test-token' },
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching ride status:', error.response ? error.response.data : error.message);
  }
})();
