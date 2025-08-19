const mongoose = require("mongoose");

const defaults = {
  'Vaccine': 20,
  'Hormone': 20,
  'Path': 50,
  'X-Ray': 30,
  'ECG': 30,
  'USG': 20,
  'Echo': 20,
  'Less': 0
};

const getTestCategory = (testName) => {
  if (!testName) return 'Path';
  const lowerName = testName.toLowerCase();
  if (lowerName.includes('vaccine')) return 'Vaccine';
  if (lowerName.includes('echo')) return 'Echo';
  if (lowerName.includes('ecg') || lowerName.includes('e.c.g') || lowerName.includes('e.t.t-stress')) return 'ECG';
  if (lowerName.includes('x-ray') || lowerName.includes('p/a view') || lowerName.includes('b/v') || lowerName.includes('lat.') || lowerName.includes('p.n.s.') || lowerName.includes('opg') || lowerName.includes('ba-') || lowerName.includes('ivu') || lowerName.includes('retrograde')) return 'X-Ray';
  if (lowerName.includes('usg') || lowerName.includes('kub') || lowerName.includes('abdomen') || lowerName.includes('pelvic') || lowerName.includes('hbs') || lowerName.includes('genito-urinary')) return 'USG';
  if (lowerName.includes('thyroid') || lowerName.includes('t4') || lowerName.includes('ft4') || lowerName.includes('testosterone') || lowerName.includes('hba1c') || lowerName.includes('vitamin d') || lowerName.includes('ca-') || lowerName.includes('hormone')) return 'Hormone';
  return 'Path';
};

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
  doctorCommissionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
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

// Update the updatedAt field and set default commission if not set or title changed
testSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.isNew || this.isModified('title') || this.doctorCommissionPercentage === 0) {
    const cat = getTestCategory(this.title);
    this.doctorCommissionPercentage = defaults[cat] || 50; // default to Path if not found
  }
  next();
});

const TestModel = mongoose.models.test || mongoose.model("test", testSchema);

module.exports = TestModel;