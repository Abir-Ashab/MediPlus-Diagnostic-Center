const mongoose = require('mongoose');

const doctorPaymentSchema = new mongoose.Schema({
  doctorName: { type: String, required: true },
  paymentAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  dateFilter: { type: String, default: 'all' }, // To track payments for specific time periods
  customDateRange: {
    start: { type: String },
    end: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DoctorPayment', doctorPaymentSchema);