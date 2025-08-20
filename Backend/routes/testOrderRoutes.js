const express = require("express");
const router = express.Router();
const TestOrderModel = require("../models/TestOrder");
const PatientModel = require("../models/Patient.model");
const { DoctorModel } = require("../models/Doctor.model");
const { BrokerModel } = require("../models/Brokers.model");

const recalculatePatientDueAmounts = async (patientID) => {
  const orders = await TestOrderModel.find({ patientID });
  let totalDue = 0;
  for (const order of orders) {
    const orderDue = order.totalAmount - (order.paidAmount || 0);
    totalDue += orderDue;
    await TestOrderModel.findByIdAndUpdate(order._id, { dueAmount: totalDue }, { new: true });
  }
};

router.post("/", async (req, res) => {
  try {
    const {
      patientID,
      patientName,
      doctorName,
      brokerName,
      baseAmount,
      vatRate,
      discountAmount,
      paidAmount,
      totalAmount,
      orderType,
      ...otherData
    } = req.body;

    let doctorRevenue = 0;
    let hospitalRevenue = totalAmount || baseAmount;
    let brokerRevenue = 0;

    // Calculate doctor revenue
    if (doctorName) {
      const doctor = await DoctorModel.findOne({ docName: doctorName });
      if (doctor) {
        if (orderType === "appointment") {
          doctorRevenue = doctor.remuneration || 0;
          hospitalRevenue = totalAmount - doctorRevenue;
        } else {
          if (doctor.testReferralCommission > 0) {
            doctorRevenue = (totalAmount * doctor.testReferralCommission) / 100;
            hospitalRevenue = totalAmount - doctorRevenue;
          }
        }
      }
    }

    // Calculate broker revenue
    if (brokerName) {
      const broker = await BrokerModel.findOne({ name: brokerName });
      if (broker && broker.commissionRate > 0) {
        brokerRevenue = (totalAmount * broker.commissionRate) / 100;
        hospitalRevenue -= brokerRevenue;
      }
    }

    const testOrderData = {
      ...otherData,
      patientID,
      patientName,
      doctorName,
      brokerName,
      baseAmount,
      vatRate: vatRate || 1,
      vatAmount: baseAmount ? (baseAmount * (vatRate || 1)) / 100 : 0,
      discountAmount: discountAmount || 0,
      totalAmount: totalAmount || baseAmount + (baseAmount * (vatRate || 1)) / 100 - (discountAmount || 0),
      paidAmount: paidAmount || 0,
      doctorRevenue,
      hospitalRevenue,
      brokerRevenue,
      orderType: orderType || "test",
    };

    const newTestOrder = new TestOrderModel(testOrderData);
    const savedTestOrder = await newTestOrder.save();
    res.status(201).json(savedTestOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all test orders
router.get("/", async (req, res) => {
  try {
    const testOrders = await TestOrderModel.find(req.query).sort({ createdAt: -1 });
    res.status(200).json(testOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific test order by ID
router.get("/:id", async (req, res) => {
  try {
    const testOrder = await TestOrderModel.findById(req.params.id);
    if (!testOrder) {
      return res.status(404).json({ message: "Test order not found" });
    }
    res.status(200).json(testOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update test order details
router.put("/:id", async (req, res) => {
  try {
    const {
      patientName,
      age,
      gender,
      email,
      mobile,
      disease,
      doctorName,
      brokerName,
      address,
      date,
      time,
      baseAmount,
      vatRate,
      vatAmount,
      discountAmount,
      paidAmount,
      totalAmount,
      hospitalRevenue,
      doctorRevenue,
      brokerRevenue,
    } = req.body;

    const testOrder = await TestOrderModel.findById(req.params.id);
    if (!testOrder) {
      return res.status(404).json({ message: "Test order not found" });
    }

    // Calculate broker revenue if updated
    let newBrokerRevenue = brokerRevenue || testOrder.brokerRevenue;
    if (brokerName && brokerName !== testOrder.brokerName) {
      const broker = await BrokerModel.findOne({ name: brokerName });
      if (broker && broker.commissionRate > 0) {
        newBrokerRevenue = (totalAmount * broker.commissionRate) / 100;
      }
    }

    // Update fields
    testOrder.patientName = patientName || testOrder.patientName;
    testOrder.age = age || testOrder.age;
    testOrder.gender = gender || testOrder.gender;
    testOrder.email = email || testOrder.email;
    testOrder.mobile = mobile || testOrder.mobile;
    testOrder.disease = disease || testOrder.disease;
    testOrder.doctorName = doctorName || testOrder.doctorName;
    testOrder.brokerName = brokerName || testOrder.brokerName;
    testOrder.address = address || testOrder.address;
    testOrder.date = date || testOrder.date;
    testOrder.time = time || testOrder.time;
    testOrder.baseAmount = baseAmount || testOrder.baseAmount;
    testOrder.vatRate = vatRate || testOrder.vatRate;
    testOrder.vatAmount = vatAmount || (baseAmount ? (baseAmount * (vatRate || testOrder.vatRate)) / 100 : testOrder.vatAmount);
    testOrder.discountAmount = discountAmount || testOrder.discountAmount;
    testOrder.totalAmount = totalAmount || testOrder.totalAmount;
    testOrder.paidAmount = paidAmount || testOrder.paidAmount;
    testOrder.dueAmount = (totalAmount || testOrder.totalAmount) - (paidAmount || testOrder.paidAmount);
    testOrder.hospitalRevenue = hospitalRevenue || testOrder.hospitalRevenue;
    testOrder.doctorRevenue = doctorRevenue || testOrder.doctorRevenue;
    testOrder.brokerRevenue = newBrokerRevenue;

    const updatedTestOrder = await testOrder.save();

    // Recalculate dueAmount for all patient orders
    if (testOrder.patientID) {
      await recalculatePatientDueAmounts(testOrder.patientID);
    }

    res.status(200).json(updatedTestOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update test order status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTestOrder = await TestOrderModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updatedTestOrder) {
      return res.status(404).json({ message: "Test order not found" });
    }
    res.status(200).json(updatedTestOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update test results
router.patch("/:id/results", async (req, res) => {
  try {
    const { testId, testResult } = req.body;
    const testOrder = await TestOrderModel.findById(req.params.id);
    if (!testOrder) {
      return res.status(404).json({ message: "Test order not found" });
    }
    const testIndex = testOrder.tests.findIndex((test) => test._id.toString() === testId);
    if (testIndex === -1) {
      return res.status(404).json({ message: "Test not found in this order" });
    }
    testOrder.tests[testIndex].testResult = testResult;
    const allTestsComplete = testOrder.tests.every((test) => test.testResult !== "Pending");
    testOrder.status = allTestsComplete ? "Completed" : "In Progress";
    if (allTestsComplete) {
      testOrder.reportGeneratedAt = new Date();
    }
    const updatedTestOrder = await testOrder.save();
    res.status(200).json(updatedTestOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark test report as delivered
router.patch("/:id/deliver", async (req, res) => {
  try {
    const updatedTestOrder = await TestOrderModel.findByIdAndUpdate(
      req.params.id,
      { reportDeliveredAt: new Date() },
      { new: true }
    );
    if (!updatedTestOrder) {
      return res.status(404).json({ message: "Test order not found" });
    }
    res.status(200).json(updatedTestOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get test orders for a specific patient
router.get("/patients/:patientId/testorders", async (req, res) => {
  try {
    const testOrders = await TestOrderModel.find({ patientID: req.params.patientId });
    res.status(200).json(testOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a test order
router.delete("/:id", async (req, res) => {
  try {
    const deletedTestOrder = await TestOrderModel.findByIdAndDelete(req.params.id);
    if (!deletedTestOrder) {
      return res.status(404).json({ message: "Test order not found" });
    }
    if (deletedTestOrder.patientID) {
      await recalculatePatientDueAmounts(deletedTestOrder.patientID);
    }
    res.status(200).json({ message: "Test order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update doctor revenue after payment
router.patch("/doctors/:doctorName/reduce-revenue", async (req, res) => {
  try {
    const { doctorName } = req.params;
    const { paymentAmount, dateFilter, customDateRange } = req.body;
    if (!doctorName || paymentAmount === undefined) {
      return res.status(400).json({ message: "Doctor name and payment amount are required" });
    }
    let dateQuery = {};
    const now = new Date();
    switch (dateFilter) {
      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        dateQuery.createdAt = { $gte: weekStart, $lte: weekEnd };
        break;
      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        dateQuery.createdAt = { $gte: monthStart, $lte: monthEnd };
        break;
      case "year":
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        yearEnd.setHours(23, 59, 59, 999);
        dateQuery.createdAt = { $gte: yearStart, $lte: yearEnd };
        break;
      case "custom":
        if (customDateRange && customDateRange.start && customDateRange.end) {
          const startDate = new Date(customDateRange.start);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          dateQuery.createdAt = { $gte: startDate, $lte: endDate };
        }
        break;
    }
    const query = {
      doctorName,
      doctorRevenue: { $gt: 0 },
      ...dateQuery,
    };
    const testOrders = await TestOrderModel.find(query).sort({ createdAt: 1 });
    if (testOrders.length === 0) {
      return res.status(404).json({ message: "No pending revenue found for this doctor in the specified period" });
    }
    const totalPendingRevenue = testOrders.reduce((sum, order) => sum + (order.doctorRevenue || 0), 0);
    if (paymentAmount > totalPendingRevenue) {
      return res.status(400).json({
        message: `Payment amount (${paymentAmount}) exceeds pending revenue (${totalPendingRevenue.toFixed(2)})`,
      });
    }
    let remainingPayment = paymentAmount;
    const updatedOrders = [];
    for (const order of testOrders) {
      if (remainingPayment <= 0) break;
      const orderRevenue = order.doctorRevenue || 0;
      const paymentForThisOrder = Math.min(remainingPayment, orderRevenue);
      const newDoctorRevenue = orderRevenue - paymentForThisOrder;
      const newHospitalRevenue = (order.hospitalRevenue || 0) + paymentForThisOrder;
      const updatedOrder = await TestOrderModel.findByIdAndUpdate(
        order._id,
        {
          doctorRevenue: newDoctorRevenue,
          hospitalRevenue: newHospitalRevenue,
          lastPaymentDate: new Date(),
          lastPaymentAmount: paymentForThisOrder,
          totalPaymentsMade: (order.totalPaymentsMade || 0) + paymentForThisOrder,
          $push: {
            paymentHistory: {
              paymentDate: new Date(),
              paymentAmount: paymentForThisOrder,
              previousRevenue: orderRevenue,
              newRevenue: newDoctorRevenue,
            },
          },
        },
        { new: true }
      );
      updatedOrders.push(updatedOrder);
      remainingPayment -= paymentForThisOrder;
    }
    res.status(200).json({
      message: "Doctor revenue updated successfully",
      paymentProcessed: paymentAmount,
      ordersUpdated: updatedOrders.length,
      remainingPayment,
      updatedOrders: updatedOrders.map((order) => ({
        orderId: order._id,
        patientName: order.patientName,
        previousRevenue: testOrders.find((o) => o._id.toString() === order._id.toString())?.doctorRevenue || 0,
        newRevenue: order.doctorRevenue,
        paymentApplied: (testOrders.find((o) => o._id.toString() === order._id.toString())?.doctorRevenue || 0) - order.doctorRevenue,
      })),
    });
  } catch (error) {
    console.error("Error updating doctor revenue:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get revenue distribution report
router.get("/reports/revenue", async (req, res) => {
  try {
    const { startDate, endDate, doctorName } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (doctorName && doctorName !== "") {
      query.doctorName = doctorName;
    }
    const testOrders = await TestOrderModel.find(query);
    const summary = testOrders.reduce(
      (acc, order) => {
        acc.totalRevenue += order.totalAmount || 0;
        acc.hospitalRevenue += order.hospitalRevenue || 0;
        acc.doctorRevenue += order.doctorRevenue || 0;
        acc.brokerRevenue += order.brokerRevenue || 0;
        acc.totalOrders += 1;
        return acc;
      },
      { totalRevenue: 0, hospitalRevenue: 0, doctorRevenue: 0, brokerRevenue: 0, totalOrders: 0 }
    );
    const doctorBreakdown = {};
    testOrders.forEach((order) => {
      if (order.doctorName && order.doctorName !== "") {
        if (!doctorBreakdown[order.doctorName]) {
          doctorBreakdown[order.doctorName] = {
            totalRevenue: 0,
            commission: 0,
            orders: 0,
          };
        }
        doctorBreakdown[order.doctorName].totalRevenue += order.totalAmount || 0;
        doctorBreakdown[order.doctorName].commission += order.doctorRevenue || 0;
        doctorBreakdown[order.doctorName].orders += 1;
      }
    });
    const brokerBreakdown = {};
    testOrders.forEach((order) => {
      if (order.brokerName && order.brokerName !== "") {
        if (!brokerBreakdown[order.brokerName]) {
          brokerBreakdown[order.brokerName] = {
            totalRevenue: 0,
            commission: 0,
            orders: 0,
          };
        }
        brokerBreakdown[order.brokerName].totalRevenue += order.totalAmount || 0;
        brokerBreakdown[order.brokerName].commission += order.brokerRevenue || 0;
        brokerBreakdown[order.brokerName].orders += 1;
      }
    });
    res.status(200).json({
      summary,
      doctorBreakdown,
      brokerBreakdown,
      orders: testOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get doctor commission settings
router.get("/doctors/commission", async (req, res) => {
  try {
    const doctors = await DoctorModel.find({}, { docName: 1, department: 1, remuneration: 1, testReferralCommission: 1 });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get broker revenue
router.get("/revenue/broker", async (req, res) => {
  try {
    const brokerRevenue = await TestOrderModel.aggregate([
      { $match: { brokerName: { $ne: null, $ne: "" } } },
      {
        $group: {
          _id: "$brokerName",
          totalRevenue: { $sum: "$brokerRevenue" },
          appointments: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);
    const totalResult = await TestOrderModel.aggregate([
      {
        $group: {
          _id: null,
          totalBrokerRevenue: { $sum: "$brokerRevenue" },
          totalAppointments: { $sum: { $cond: [{ $ne: ["$brokerName", ""] }, 1, 0] } },
        },
      },
    ]);
    res.status(200).send({
      brokers: brokerRevenue,
      summary: totalResult[0] || { totalBrokerRevenue: 0, totalAppointments: 0 },
    });
  } catch (error) {
    console.error("Error fetching broker revenue:", error);
    res.status(400).send({ error: "Failed to fetch broker revenue" });
  }
});

module.exports = router;