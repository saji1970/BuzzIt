const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  planId: {
    type: String,
    required: true,
  },
  planName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);

