require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/userModel");

const { MONGO_URI, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

async function createAdmin() {
  try {
    // Connect to database
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      username: ADMIN_USERNAME || "admin@hospital.com" 
    });

    if (existingAdmin) {
      console.log("ℹ️  Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      username: ADMIN_USERNAME || "admin@hospital.com",
      role: "admin",
      status: "ACTIVE"
    });

    await admin.setPassword(ADMIN_PASSWORD || "Admin@123");
    await admin.save();

    console.log("✅ Admin user created successfully");
    console.log(`   Username: ${admin.username}`);
    console.log(`   Password: ${ADMIN_PASSWORD || "Admin@123"}`);
    console.log(`   Role: ${admin.role}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();

