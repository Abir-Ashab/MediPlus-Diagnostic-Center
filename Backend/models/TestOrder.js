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
    },
    gender: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    disease: {
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
    },
    vatRate: {
      type: Number,
      default: 1, // 1% default VAT
    },
    vatAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    hospitalRevenue: {
      type: Number,
      required: true,
    },
    doctorRevenue: {
      type: Number,
      default: 0,
    },
    brokerRevenue: {
      type: Number,
      default: 0,
    },
    date: {
      type: String,
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

const TestOrderModel = mongoose.model("testorder", testOrderSchema);

module.exports = TestOrderModel;
