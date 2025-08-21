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

  // Base amount before VAT and discount
  baseAmount: {
    type: Number,
  },

  // VAT percentage and amount
  vatRate: {
    type: Number,
    default: 1 // 1% default VAT
  },

  vatAmount: {
    type: Number,
    default: 0
  },

  // Discount/Less amount
  discountAmount: {
    type: Number,
    default: 0
  },

  // Final total after VAT and discount
  totalAmount: {
    type: Number,
    required: true
  },

  paidAmount: {
    type: Number,
    default: 0
  },

  dueAmount: {
    type: Number,
    default: 0
  },

  doctorName: {
    type: String
  },

  agentName: {
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

  agentRevenue: {
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

  orderType: {
    type: String,
    enum: ['appointment', 'test', 'combined'],
    default: 'test'
  }
});

const AppointmentModel = mongoose.model("appointment", appointmentSchema);

module.exports = { AppointmentModel };