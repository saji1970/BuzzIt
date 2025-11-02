const mongoose = require('mongoose');

const liveStreamSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  streamUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: null,
  },
  isLive: {
    type: Boolean,
    default: true,
    index: true,
  },
  viewers: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    default: 'general',
  },
  startedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  endedAt: {
    type: Date,
    default: null,
  },
  tags: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// Indexes for faster queries
liveStreamSchema.index({ isLive: 1, startedAt: -1 });
liveStreamSchema.index({ userId: 1, isLive: 1 });

module.exports = mongoose.model('LiveStream', liveStreamSchema);

