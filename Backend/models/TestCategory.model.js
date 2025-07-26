const mongoose = require("mongoose");

const testCategorySchema = mongoose.Schema({
  categoryId: {
    type: String,
    required: true,
    unique: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
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
testCategorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const TestCategoryModel = mongoose.models.testcategory || mongoose.model("testcategory", testCategorySchema);

module.exports = TestCategoryModel;
