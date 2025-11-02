const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  verificationId: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // Auto-delete expired codes
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);

