const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ MongoDB already connected');
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/buzzit';
    
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
    console.error('❌ MongoDB connection error:', error);
    console.error('MongoDB URI:', mongoURI ? 'Set (hidden)' : 'Not set');
    isConnected = false;
    // Don't throw - allow server to start in fallback mode
    console.warn('⚠️ Server will continue without database connection');
    // Optionally, you could retry connection here
  }
};

module.exports = { connectDB, isConnected: () => isConnected };

