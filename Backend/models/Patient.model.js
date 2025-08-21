const mongoose = require("mongoose");

const agentSchema = mongoose.Schema({
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
    unique: true,
  },

  email: {
    type: String,
    required: false,
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
});

const AgentModel = mongoose.model("agent", agentSchema);

module.exports = { AgentModel };