const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    unique: true, // unique: true automatically creates an index
    required: true,
    lowercase: true,
    trim: true,
    // Don't add index: true here since unique already creates one
  },
  password: {
    type: String,
    required: false, // For users created via mobile verification
  },
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: '',
  },
  mobileNumber: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: null,
  },
  dateOfBirth: {
    type: String,
    default: null,
  },
  interests: [{
    id: String,
    name: String,
    category: String,
    emoji: String,
  }],
  followers: {
    type: Number,
    default: 0,
  },
  following: {
    type: Number,
    default: 0,
  },
  buzzCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  subscribedChannels: [{
    type: String,
  }],
  blockedUsers: [{
    type: String,
  }],
  isVerified: {
    type: Boolean,
    default: false,
  },
  banned: {
    type: Boolean,
    default: false,
  },
  bannedAt: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin', 'super_admin'],
  },
}, {
  timestamps: true,
});

// Index for faster queries
// Note: username index is handled by unique: true above, so we skip it here to avoid duplicate
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);

