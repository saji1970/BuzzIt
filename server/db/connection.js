const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ MongoDB already connected');
    return;
  }

  // Get MongoDB URI - define it outside try block for error logging
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URL;
  
  if (!mongoURI) {
    console.warn('⚠️ MONGODB_URI environment variable not set');
    console.warn('⚠️ Server will run in fallback mode (in-memory storage only)');
    console.warn('⚠️ To enable database, set MONGODB_URI in Railway environment variables');
    isConnected = false;
    return; // Don't attempt connection if URI is not set
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      connectTimeoutMS: 5000, // Give up initial connection after 5s
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      isConnected = true;
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message || error);
    isConnected = false;
    // Don't throw - allow server to start in fallback mode
    console.warn('⚠️ Server will continue without database connection');
    console.warn('⚠️ Users and data will be stored in memory only');
    // Optionally, you could retry connection here
  }
};

module.exports = { connectDB, isConnected: () => isConnected };

