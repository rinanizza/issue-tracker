const mongoose = require("mongoose");

// Connect to MongoDB
const db = mongoose.connect(process.env.MONGO_URI);

// Connection events
mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${process.env.MONGO_URI}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Handle process termination (e.g., server shutdown)
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose disconnected through app termination (SIGINT)');
  process.exit(0);
});

module.exports = db;