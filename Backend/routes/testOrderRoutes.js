// routes/testOrderRoutes.js
const express = require("express");
const router = express.Router();
const TestOrderModel = require("../models/TestOrder");
const PatientModel = require("../models/Patient.model"); // Assuming you have a Patient model

// Create a new test order
router.post("/", async (req, res) => {
  try {
    const newTestOrder = new TestOrderModel(req.body);
    const savedTestOrder = await newTestOrder.save();
    res.status(201).json(savedTestOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all test orders
router.get("/", async (req, res) => {
  try {
    const testOrders = await TestOrderModel.find().sort({ createdAt: -1 });
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

module.exports = router;