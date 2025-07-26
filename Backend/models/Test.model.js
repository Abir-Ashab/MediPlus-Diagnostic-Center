const mongoose = require("mongoose");

const testSchema = mongoose.Schema({
  testId: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
testSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const TestModel = mongoose.models.test || mongoose.model("test", testSchema);

module.exports = TestModel;
