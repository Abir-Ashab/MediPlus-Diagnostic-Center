const mongoose = require('mongoose');

const doctorPaymentSchema = new mongoose.Schema({
  doctorName: { type: String, required: true },
  paymentAmount: { type: Number, default: 0 }, // Cumulative payment amount
  dueAmount: { type: Number, default: 0 }, // Remaining amount due
  totalAmount: { type: Number, default: 0 }, // Total revenue for this period
  dateFilter: { type: String, default: 'all' }, // To track payments for specific time periods
  customDateRange: {
    start: { type: String },
    end: { type: String },
  },
  paymentHistory: [{
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    previousTotal: { type: Number, default: 0 },
    newTotal: { type: Number, default: 0 }
  }], // Track payment history for audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
doctorPaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create compound index for efficient queries
doctorPaymentSchema.index({ doctorName: 1, dateFilter: 1 }, { unique: true });

module.exports = mongoose.model('DoctorPayment', doctorPaymentSchema);