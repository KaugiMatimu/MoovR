const socketIo = require("socket.io");

let io;

module.exports = {
  // Initialize Socket.io with the HTTP server
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: ["http://localhost:5173", "http://localhost:5175", "http://localhost:3000", "http://localhost:3001"], // Allow your frontend origins
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    io.on("connection", (socket) => {
      console.log("New client connected", socket.id);

      // Join a private room based on user ID
      socket.on("join", (userId) => {
        if (userId) {
          const userRoom = `user_${userId.toString()}`;
          socket.join(userRoom);
          console.log(`User ${userId} joined room ${userRoom}`);
        }
      });

      // Join a ride-specific room for live trip updates
      socket.on("joinRide", (rideId) => {
        if (rideId) {
          const rideRoom = `ride_${rideId}`;
          socket.join(rideRoom);
          console.log(`Socket ${socket.id} joined ride room ${rideRoom}`);
        }
      });

      // Handle location updates from drivers
      socket.on("updateLocation", (data) => {
        console.log("Received driver location:", data);
        const { driverId, coordinates, rideId } = data;
        if (rideId) {
          io.to(`ride_${rideId}`).emit("driverLocationUpdate", { driverId, coordinates, rideId });
        } else {
          io.emit("driverLocationUpdate", { driverId, coordinates });
        }
      });

      // Handle location updates from passengers
      socket.on("updatePassengerLocation", (data) => {
        console.log("Received passenger location:", data);
        const { passengerId, coordinates, rideId } = data;
        if (rideId) {
          io.to(`ride_${rideId}`).emit("passengerLocationUpdate", { passengerId, coordinates, rideId });
        } else {
          io.emit("passengerLocationUpdate", { passengerId, coordinates });
        }
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
    return io;
  },
  // Get the initialized Socket.io instance
  getIo: () => {
    if (!io) {
      console.warn("Socket.io not initialized yet.");
      return null;
    }
    return io;
  },
};
