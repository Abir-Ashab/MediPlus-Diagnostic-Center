// routes/testOrderRoutes.js
const express = require("express");
const router = express.Router();
const TestOrderModel = require("../models/TestOrder");
const PatientModel = require("../models/Patient.model"); // Assuming you have a Patient model
const { DoctorModel } = require("../models/Doctor.model");

// Create a new test order with dynamic revenue calculation
router.post("/", async (req, res) => {
  try {
    const { doctorName, totalAmount, orderType, ...otherData } = req.body;
    
    let doctorRevenue = 0;
    let hospitalRevenue = totalAmount;
    
    // If doctor is specified, calculate commission based on order type
    if (doctorName && doctorName !== "") {
      const doctor = await DoctorModel.findOne({ docName: doctorName });
      if (doctor) {
        if (orderType === 'appointment') {
          // For appointments, doctor gets their consultation fee (remuneration)
          // The consultation fee should already be included in totalAmount
          doctorRevenue = doctor.remuneration || 0;
          hospitalRevenue = totalAmount - doctorRevenue;
        } else {
          // For test orders, use the test referral commission percentage
          if (doctor.testReferralCommission > 0) {
            doctorRevenue = (totalAmount * doctor.testReferralCommission) / 100;
            hospitalRevenue = totalAmount - doctorRevenue;
          }
        }
      }
    }
    
    const testOrderData = {
      ...otherData,
      doctorName,
      totalAmount,
      doctorRevenue,
      hospitalRevenue,
      orderType: orderType || 'test'
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
  let query = req.query;
  try {
    const testOrders = await TestOrderModel.find(query).sort({ createdAt: -1 });
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

// Update a test order status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTestOrder = await TestOrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
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

// Update test results
router.patch("/:id/results", async (req, res) => {
  try {
    const { testId, testResult } = req.body;
    const testOrder = await TestOrderModel.findById(req.params.id);
    
    if (!testOrder) {
      return res.status(404).json({ message: "Test order not found" });
    }
    
    // Find the test by its name and update the result
    const testIndex = testOrder.tests.findIndex(test => test._id.toString() === testId);
    if (testIndex === -1) {
      return res.status(404).json({ message: "Test not found in this order" });
    }
    
    testOrder.tests[testIndex].testResult = testResult;
    
    // Check if all tests have results, update status to "Completed"
    const allTestsComplete = testOrder.tests.every(test => test.testResult !== "Pending");
    if (allTestsComplete) {
      testOrder.status = "Completed";
      testOrder.reportGeneratedAt = new Date();
    } else {
      // Some tests are complete but not all
      testOrder.status = "In Progress";
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

// Delete a test order by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedTestOrder = await TestOrderModel.findByIdAndDelete(req.params.id);

    if (!deletedTestOrder) {
      return res.status(404).json({ message: "Test order not found" });
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

    // Build date query based on filter
    let dateQuery = {};
    const now = new Date();
    
    switch (dateFilter) {
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        dateQuery.createdAt = { $gte: weekStart, $lte: weekEnd };
        break;
        
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        dateQuery.createdAt = { $gte: monthStart, $lte: monthEnd };
        break;
        
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        yearEnd.setHours(23, 59, 59, 999);
        dateQuery.createdAt = { $gte: yearStart, $lte: yearEnd };
        break;
        
      case 'custom':
        if (customDateRange && customDateRange.start && customDateRange.end) {
          const startDate = new Date(customDateRange.start);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          dateQuery.createdAt = { $gte: startDate, $lte: endDate };
        }
        break;
        
      default: // 'all' or any other value
        // No date filter
        break;
    }

    // Find test orders for this doctor within the date range
    const query = { 
      doctorName: doctorName,
      doctorRevenue: { $gt: 0 }, // Only orders with pending revenue
      ...dateQuery 
    };

    const testOrders = await TestOrderModel.find(query).sort({ createdAt: 1 });

    if (testOrders.length === 0) {
      return res.status(404).json({ message: "No pending revenue found for this doctor in the specified period" });
    }

    // Calculate total pending revenue
    const totalPendingRevenue = testOrders.reduce((sum, order) => sum + (order.doctorRevenue || 0), 0);
    
    if (paymentAmount > totalPendingRevenue) {
      return res.status(400).json({ 
        message: `Payment amount (${paymentAmount}) exceeds pending revenue (${totalPendingRevenue.toFixed(2)})` 
      });
    }

    // Distribute the payment across orders proportionally
    let remainingPayment = paymentAmount;
    const updatedOrders = [];

    for (const order of testOrders) {
      if (remainingPayment <= 0) break;

      const orderRevenue = order.doctorRevenue || 0;
      const paymentForThisOrder = Math.min(remainingPayment, orderRevenue);
      
      const newDoctorRevenue = orderRevenue - paymentForThisOrder;
      const newHospitalRevenue = (order.hospitalRevenue || 0) + paymentForThisOrder;

      // Update the order
      const updatedOrder = await TestOrderModel.findByIdAndUpdate(
        order._id,
        {
          doctorRevenue: newDoctorRevenue,
          hospitalRevenue: newHospitalRevenue,
          lastPaymentDate: new Date(),
          lastPaymentAmount: paymentForThisOrder
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
      remainingPayment: remainingPayment,
      updatedOrders: updatedOrders.map(order => ({
        orderId: order._id,
        patientName: order.patientName,
        previousRevenue: testOrders.find(o => o._id.toString() === order._id.toString())?.doctorRevenue || 0,
        newRevenue: order.doctorRevenue,
        paymentApplied: (testOrders.find(o => o._id.toString() === order._id.toString())?.doctorRevenue || 0) - order.doctorRevenue
      }))
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
    
    // Date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Doctor filter
    if (doctorName && doctorName !== "") {
      query.doctorName = doctorName;
    }
    
    const testOrders = await TestOrderModel.find(query);
    
    // Calculate totals
    const summary = testOrders.reduce((acc, order) => {
      acc.totalRevenue += order.totalAmount || 0;
      acc.hospitalRevenue += order.hospitalRevenue || 0;
      acc.doctorRevenue += order.doctorRevenue || 0;
      acc.totalOrders += 1;
      return acc;
    }, {
      totalRevenue: 0,
      hospitalRevenue: 0,
      doctorRevenue: 0,
      totalOrders: 0
    });
    
    // Group by doctor
    const doctorBreakdown = {};
    testOrders.forEach(order => {
      if (order.doctorName && order.doctorName !== "") {
        if (!doctorBreakdown[order.doctorName]) {
          doctorBreakdown[order.doctorName] = {
            totalRevenue: 0,
            commission: 0,
            orders: 0
          };
        }
        doctorBreakdown[order.doctorName].totalRevenue += order.totalAmount || 0;
        doctorBreakdown[order.doctorName].commission += order.doctorRevenue || 0;
        doctorBreakdown[order.doctorName].orders += 1;
      }
    });
    
    res.status(200).json({
      summary,
      doctorBreakdown,
      orders: testOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get doctor commission settings
router.get("/doctors/commission", async (req, res) => {
  try {
    const doctors = await DoctorModel.find({}, {
      docName: 1,
      department: 1,
      remuneration: 1,
      testReferralCommission: 1
    });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/revenue/broker", async (req, res) => {
  try {
    // Get broker-wise revenue
    const brokerRevenue = await TestOrderModel.aggregate([
      { $match: { brokerName: { $ne: null, $ne: "" } } },
      {
        $group: {
          _id: "$brokerName",
          totalRevenue: { $sum: "$brokerRevenue" },
          appointments: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Get overall total
    const totalResult = await TestOrderModel.aggregate([
      {
        $group: {
          _id: null,
          totalBrokerRevenue: { $sum: "$brokerRevenue" },
          totalAppointments: { $sum: { $cond: [{ $ne: ["$brokerName", ""] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).send({
      brokers: brokerRevenue,
      summary: totalResult[0] || { totalBrokerRevenue: 0, totalAppointments: 0 }
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Failed to fetch broker revenue" });
  }
});

module.exports = router;