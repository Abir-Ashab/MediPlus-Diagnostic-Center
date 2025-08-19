const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  testId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  doctorCommissionPercentage: { type: Number, default: 0 },
  brokerCommissionPercentage: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Test', testSchema);