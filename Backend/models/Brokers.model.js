const mongoose = require("mongoose");

// Check if the model is already compiled to avoid the OverwriteModelError
const BrokerModel = mongoose.models.broker || mongoose.model("broker", mongoose.Schema({
  userType: {
    type: String,
    default: "broker",
  },

  brokerID: {
    type: Number,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  mobile: {
    type: Number,
    minlength: 10,
  },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    default: "password",
  },

  age: {
    type: Number,
  },

  gender: {
    type: String,
  },

  address: {
    type: String,
  },

  image: {
    type: String,
  },

  commissionRate: {
    type: Number,
    default: 5, // Default 5% commission
  },

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },

  referrals: {
    type: Number,
    default: 0
  },

  totalCommission: {
    type: Number,
    default: 0
  },

  dateJoined: {
    type: Date,
    default: Date.now
  },

  notes: {
    type: String,
  }
}));

module.exports = { BrokerModel };