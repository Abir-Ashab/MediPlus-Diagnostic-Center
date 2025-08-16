const mongoose = require("mongoose");

const appointmentSchema = mongoose.Schema({
  userType: {
    type: String,
    default: "patient",
  },

  patientID: {
    type: Number,
  },

  patientName: {
    type: String,
  },

  mobile: {
    type: Number,
  },
  
  email: {
    type: String,
  },

  address: {
    type: String,
  },

  // Replace department with tests array
  tests: [{
    testName: {
      type: String,
      required: true
    },
    testPrice: {
      type: Number,
      required: true
    }
  }],

  totalAmount: {
    type: Number,
    required: true
  },

  doctorName: {
    type: String
  },

  brokerName: {
    type: String
  },

  hospitalRevenue: {
    type: Number,
    required: true
  },

  doctorRevenue: {
    type: Number,
    default: 0
  },

  brokerRevenue: {
    type: Number,
    default: 0
  },

  time: {
    type: String,
  },

  date: {
    type: String,
  },

  age: {
    type: Number,
    required: true,
  },

  gender: {
    type: String,
    required: true,
  },
});

const AppointmentModel = mongoose.model("appointment", appointmentSchema);

module.exports = { AppointmentModel };