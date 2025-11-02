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
    isConnected = false;
    throw error;
  }
};

module.exports = { connectDB, isConnected: () => isConnected };

