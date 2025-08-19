const express = require("express");
const TestModel = require("../models/Test.model");
const TestCategoryModel = require("../models/TestCategory.model");
const router = express.Router();

// Get all test categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await TestCategoryModel.find({ isActive: true }).sort({ categoryName: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching test categories:", error);
    res.status(500).json({ message: "Error fetching test categories", error: error.message });
  }
});

// Create a new test category
router.post("/categories", async (req, res) => {
  try {
    const { categoryId, categoryName } = req.body;
    
    if (!categoryId || !categoryName) {
      return res.status(400).json({ message: "Category ID and name are required" });
    }

    const existingCategory = await TestCategoryModel.findOne({ categoryId });
    if (existingCategory) {
      return res.status(400).json({ message: "Category ID already exists" });
    }

    const newCategory = new TestCategoryModel({ categoryId, categoryName });
    await newCategory.save();
    
    res.status(201).json({ message: "Test category created successfully", data: newCategory });
  } catch (error) {
    console.error("Error creating test category:", error);
    res.status(500).json({ message: "Error creating test category", error: error.message });
  }
});

// Update a test category
router.put("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, isActive } = req.body;
    
    const updatedCategory = await TestCategoryModel.findByIdAndUpdate(
      id,
      { categoryName, isActive, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ message: "Test category not found" });
    }
    
    res.status(200).json({ message: "Test category updated successfully", data: updatedCategory });
  } catch (error) {
    console.error("Error updating test category:", error);
    res.status(500).json({ message: "Error updating test category", error: error.message });
  }
});

// Get all tests
router.get("/", async (req, res) => {
  try {
    const { category, isActive } = req.query;
    let filter = {};
    
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const tests = await TestModel.find(filter).sort({ category: 1, title: 1 });
    res.status(200).json(tests);
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ message: "Error fetching tests", error: error.message });
  }
});

// Get a single test by ID
router.get("/:id", async (req, res) => {
  try {
    const test = await TestModel.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    res.status(200).json(test);
  } catch (error) {
    console.error("Error fetching test:", error);
    res.status(500).json({ message: "Error fetching test", error: error.message });
  }
});

// Create a new test
router.post("/", async (req, res) => {
  try {
    const { testId, title, price, category, description, doctorCommissionPercentage } = req.body;
    
    if (!testId || !title || !price || !category) {
      return res.status(400).json({ message: "Test ID, title, price, and category are required" });
    }

    const existingTest = await TestModel.findOne({ testId });
    if (existingTest) {
      return res.status(400).json({ message: "Test ID already exists" });
    }

    const newTest = new TestModel({
      testId,
      title,
      price,
      category,
      description: description || "",
      doctorCommissionPercentage: doctorCommissionPercentage || undefined // Let pre-save handle default
    });
    
    await newTest.save();
    res.status(201).json({ message: "Test created successfully", data: newTest });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({ message: "Error creating test", error: error.message });
  }
});

// Update a test
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, category, description, isActive, doctorCommissionPercentage } = req.body;
    
    const updatedTest = await TestModel.findByIdAndUpdate(
      id,
      { title, price, category, description, isActive, doctorCommissionPercentage, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!updatedTest) {
      return res.status(404).json({ message: "Test not found" });
    }
    
    res.status(200).json({ message: "Test updated successfully", data: updatedTest });
  } catch (error) {
    console.error("Error updating test:", error);
    res.status(500).json({ message: "Error updating test", error: error.message });
  }
});

// Delete a test (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedTest = await TestModel.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!updatedTest) {
      return res.status(404).json({ message: "Test not found" });
    }
    
    res.status(200).json({ message: "Test deleted successfully", data: updatedTest });
  } catch (error) {
    console.error("Error deleting test:", error);
    res.status(500).json({ message: "Error deleting test", error: error.message });
  }
});

// Bulk update test prices
router.put("/bulk/update-prices", async (req, res) => {
  try {
    const { updates } = req.body; // Array of { testId, price }
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "Updates array is required" });
    }

    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { testId: update.testId },
        update: { price: update.price, updatedAt: Date.now() }
      }
    }));

    const result = await TestModel.bulkWrite(bulkOps);
    
    res.status(200).json({ 
      message: "Bulk price update completed", 
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error("Error bulk updating test prices:", error);
    res.status(500).json({ message: "Error bulk updating test prices", error: error.message });
  }
});

module.exports = router;