const mongoose = require("mongoose");

// Check if the model is already compiled to avoid the OverwriteModelError
const AgentModel = mongoose.models.agent || mongoose.model("agent", mongoose.Schema({
  userType: {
    type: String,
    default: "agent",
  },

  agentID: {
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
    default: 0, 
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

module.exports = { AgentModel };