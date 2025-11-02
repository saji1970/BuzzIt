const mongoose = require('mongoose');

const userInteractionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    // Index is created by compound index below, so we skip individual index to avoid duplicate
  },
  buzzId: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'share', 'view'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
userInteractionSchema.index({ userId: 1, timestamp: -1 });
userInteractionSchema.index({ buzzId: 1, type: 1 });

module.exports = mongoose.model('UserInteraction', userInteractionSchema);

