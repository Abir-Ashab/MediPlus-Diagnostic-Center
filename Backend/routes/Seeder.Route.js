const express = require("express");
const { seedDatabase } = require("../seeders/testSeeder");
const Test = require("../models/Test.model");
const TestCategory = require("../models/TestCategory.model");

const router = express.Router();

// Route to seed the database with tests and categories
router.post("/seed", async (req, res) => {
  try {
    console.log("🌱 Starting database seeding...");
    
    // Check if data already exists
    const existingTests = await Test.countDocuments();
    const existingCategories = await TestCategory.countDocuments();
    
    if (existingTests > 0 || existingCategories > 0) {
      return res.status(200).json({
        message: "Database already seeded",
        testsCount: existingTests,
        categoriesCount: existingCategories
      });
    }
    
    // Run the seeder
    const result = await seedDatabase();
    
    console.log("✅ Database seeded successfully");
    res.status(200).json({
      message: "Database seeded successfully",
      ...result
    });
    
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    res.status(500).json({
      message: "Seeding failed",
      error: error.message
    });
  }
});

// Route to force reseed (clears existing data first)
router.post("/reseed", async (req, res) => {
  try {
    console.log("🔄 Starting database reseeding...");
    
    // Clear existing data
    await Test.deleteMany({});
    await TestCategory.deleteMany({});
    console.log("🗑️ Cleared existing test data");
    
    // Run the seeder
    const result = await seedDatabase();
    
    console.log("✅ Database reseeded successfully");
    res.status(200).json({
      message: "Database reseeded successfully",
      ...result
    });
    
  } catch (error) {
    console.error("❌ Reseeding failed:", error);
    res.status(500).json({
      message: "Reseeding failed",
      error: error.message
    });
  }
});

// Route to check seeding status
router.get("/status", async (req, res) => {
  try {
    const testsCount = await Test.countDocuments();
    const categoriesCount = await TestCategory.countDocuments();
    
    res.status(200).json({
      isSeeded: testsCount > 0 && categoriesCount > 0,
      testsCount,
      categoriesCount
    });
    
  } catch (error) {
    console.error("Error checking seed status:", error);
    res.status(500).json({
      message: "Error checking seed status",
      error: error.message
    });
  }
});

module.exports = router;
