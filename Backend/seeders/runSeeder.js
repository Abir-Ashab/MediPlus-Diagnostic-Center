const mongoose = require("mongoose");
const { connection } = require("../configs/db");
const { seedDatabase } = require("./testSeeder");
require("dotenv").config();

const runSeeder = async () => {
  try {
    console.log("🔗 Connecting to database...");
    await connection;
    console.log("✅ Connected to database");

    await seedDatabase();
    
    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

runSeeder();
