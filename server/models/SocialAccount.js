const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  platform: {
    type: String,
    enum: ['instagram', 'snapchat', 'facebook', 'twitter', 'tiktok'],
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

socialAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('SocialAccount', socialAccountSchema);

