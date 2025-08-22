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
        doctorCommission: {
          type: Number,
          default: 0,
          min: 0,
        },
        agentCommission: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
    doctorName: {
      type: String,
    },
    agentName: {
      type: String,
    },
    baseAmount: {
      type: Number,
      min: 0,
    },
    vatRate: {
      type: Number,
      default: 0,
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
    agentRevenue: {
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
      let due = testOrder.totalAmount - (testOrder.paidAmount || 0);
      testOrder.dueAmount = due < 0 ? 0 : due;
    }

    if (testOrder.patientID) {
      const previousOrders = await TestOrderModel.find({
        patientID: testOrder.patientID,
        _id: { $ne: testOrder._id }, 
      });
      const previousDueAmount = previousOrders.reduce((sum, order) => sum + (order.dueAmount || 0), 0);
      let due = testOrder.totalAmount - (testOrder.paidAmount || 0) + previousDueAmount;
      testOrder.dueAmount = due < 0 ? 0 : due;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to update agent's totalCommission dynamically (test-wise)
testOrderSchema.post("save", async function (doc) {
  try {
    // 1. Update agent commission as before
    if (doc.agentName && doc.tests && doc.tests.length > 0) {
      const totalAgentCommission = doc.tests.reduce((sum, t) => sum + ((t.testPrice || 0) * (t.agentCommission || 0) / 100), 0);
      if (totalAgentCommission > 0) {
        const AgentModel = mongoose.model("agent");
        const agent = await AgentModel.findOne({ name: doc.agentName });
        if (agent) {
          agent.totalCommission = (agent.totalCommission || 0) + totalAgentCommission;
          await agent.save();
        }
      }
    }

    // 2. Recalculate and update dueAmount for all test orders of this patient
    if (doc.patientID) {
      const TestOrderModel = mongoose.model("testorder");
      const allOrders = await TestOrderModel.find({ patientID: doc.patientID }).sort({ createdAt: 1 });
      let runningDue = 0;
      for (const order of allOrders) {
        const thisDue = (order.totalAmount || 0) - (order.paidAmount || 0);
        runningDue += thisDue;
        // Ensure dueAmount is never negative
        const safeDue = runningDue < 0 ? 0 : runningDue;
        if (order.dueAmount !== safeDue) {
          order.dueAmount = safeDue;
          await order.save();
        }
      }
    }
  } catch (error) {
    console.error("Error updating agent commission or recalculating due:", error);
  }
});

const TestOrderModel = mongoose.model("testorder", testOrderSchema);

module.exports = TestOrderModel;
