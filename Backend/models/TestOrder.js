const mongoose = require("mongoose");

const testOrderSchema = new mongoose.Schema(
  {
    patientID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patients",
    },
    patientName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    tests: [
      {
        testName: {
          type: String,
          required: true,
        },
        testPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        testResult: {
          type: String,
          default: "Pending",
        },
      },
    ],
    doctorName: {
      type: String,
    },
    brokerName: {
      type: String,
    },
    baseAmount: {
      type: Number,
      min: 0,
    },
    vatRate: {
      type: Number,
      default: 1,
      min: 0,
    },
    vatAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    hospitalRevenue: {
      type: Number,
      required: true,
      min: 0,
    },
    doctorRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    brokerRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPaymentDate: {
      type: Date,
      default: null,
    },
    lastPaymentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPaymentsMade: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentHistory: [
      {
        paymentDate: {
          type: Date,
          default: Date.now,
        },
        paymentAmount: {
          type: Number,
          required: true,
          min: 0,
        },
        previousRevenue: {
          type: Number,
          required: true,
          min: 0,
        },
        newRevenue: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    date: {
      type: String, // Consider changing to Date
    },
    time: {
      type: String,
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
    },
    orderType: {
      type: String,
      enum: ["appointment", "test", "combined"],
      default: "test",
    },
    reportGeneratedAt: {
      type: Date,
    },
    reportDeliveredAt: {
      type: Date,
    },
    userType: {
      type: String,
      default: "patient",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pre-save middleware for calculations
testOrderSchema.pre("save", async function (next) {
  try {
    const testOrder = this;

    // Calculate vatAmount and totalAmount
    if (testOrder.baseAmount && !testOrder.isModified("vatAmount")) {
      testOrder.vatAmount = (testOrder.baseAmount * testOrder.vatRate) / 100;
    }
    if (testOrder.baseAmount && !testOrder.isModified("totalAmount")) {
      testOrder.totalAmount = testOrder.baseAmount + testOrder.vatAmount - (testOrder.discountAmount || 0);
    }
    if (!testOrder.isModified("dueAmount")) {
      testOrder.dueAmount = testOrder.totalAmount - (testOrder.paidAmount || 0);
    }

    // Aggregate dueAmount for the patient
    if (testOrder.patientID) {
      const previousOrders = await TestOrderModel.find({
        patientID: testOrder.patientID,
        _id: { $ne: testOrder._id }, // Exclude current order
      });
      const previousDueAmount = previousOrders.reduce((sum, order) => sum + (order.dueAmount || 0), 0);
      testOrder.dueAmount = testOrder.totalAmount - (testOrder.paidAmount || 0) + previousDueAmount;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to update broker's totalCommission
testOrderSchema.post("save", async function (doc) {
  try {
    if (doc.brokerName && doc.brokerRevenue > 0) {
      const BrokerModel = mongoose.model("broker");
      const broker = await BrokerModel.findOne({ name: doc.brokerName });
      if (broker) {
        broker.totalCommission = (broker.totalCommission || 0) + doc.brokerRevenue;
        await broker.save();
      }
    }
  } catch (error) {
    console.error("Error updating broker commission:", error);
  }
});

const TestOrderModel = mongoose.model("testorder", testOrderSchema);

module.exports = TestOrderModel;
