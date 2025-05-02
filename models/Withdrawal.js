const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
  },
  networkFee: {
    type: Number,
    default: 0.0001,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
