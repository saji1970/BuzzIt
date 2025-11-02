const mongoose = require('mongoose');

const buzzSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
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
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio'],
    default: 'text',
  },
  media: {
    type: {
      type: String,
      default: null,
    },
    url: {
      type: String,
      default: null,
    },
  },
  interests: [{
    id: String,
    name: String,
    category: String,
    emoji: String,
  }],
  location: {
    latitude: Number,
    longitude: Number,
    city: String,
    country: String,
  },
  buzzType: {
    type: String,
    enum: ['event', 'gossip', 'thought', 'poll'],
    default: 'thought',
  },
  eventDate: {
    type: Date,
    default: null,
  },
  pollOptions: [{
    id: String,
    text: String,
  }],
  likes: {
    type: Number,
    default: 0,
  },
  comments: {
    type: Number,
    default: 0,
  },
  shares: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  isLiked: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
buzzSchema.index({ userId: 1, createdAt: -1 });
buzzSchema.index({ createdAt: -1 });
buzzSchema.index({ 'interests.id': 1 });

module.exports = mongoose.model('Buzz', buzzSchema);

