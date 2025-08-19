const mongoose = require('mongoose');

const brokerPaymentSchema = new mongoose.Schema({
  brokerName: { type: String, required: true },
  paymentAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  dateFilter: { type: String, default: 'all' },
  customDateRange: {
    start: { type: String },
    end: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BrokerPayment', brokerPaymentSchema);