const mongoose = require("mongoose");

const appointmentSchema = mongoose.Schema({
  userType: {
    type: String,
    default: "patient",
  },

  patientID: {
    type: Number,
    // required: true,
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

  disease: {
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

  // Add total amount field
  totalAmount: {
    type: Number,
    required: true
  },

  // Add doctor name field
  doctorName: {
    type: String
  },

  // Add broker name field
  brokerName: {
    type: String
  },

  // Revenue distribution fields
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