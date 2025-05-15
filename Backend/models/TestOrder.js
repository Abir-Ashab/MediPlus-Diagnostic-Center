// Backend - models/TestOrder.js
const mongoose = require("mongoose");

const testOrderSchema = new mongoose.Schema(
  {
    patientID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patients",
      // required: true,
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
      required: true,
    },
    disease: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
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
      default: "",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    hospitalRevenue: {
      type: Number,
      required: true,
    },
    doctorRevenue: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
    },
    orderType: {
      type: String,
      default: "test",
    },
    reportGeneratedAt: {
      type: Date,
    },
    reportDeliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const TestOrderModel = mongoose.model("testorder", testOrderSchema);

module.exports = TestOrderModel;
