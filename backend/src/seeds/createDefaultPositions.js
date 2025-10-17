require("dotenv").config();
const mongoose = require("mongoose");
const Position = require("../models/Position");
const User = require("../models/userModel");

const { MONGO_URI } = process.env;

const defaultPositions = [
  { title: "Nurse", description: "Registered nurse providing patient care" },
  { title: "Doctor", description: "Medical doctor providing diagnosis and treatment" },
  { title: "Receptionist", description: "Front desk staff handling patient registration" },
  { title: "Lab Technician", description: "Laboratory staff conducting tests and analysis" },
  { title: "Pharmacist", description: "Pharmacy staff managing medications" },
  { title: "Radiologist", description: "Imaging specialist for X-rays, CT scans, etc." },
  { title: "Physiotherapist", description: "Physical therapy and rehabilitation specialist" },
  { title: "Administrative Staff", description: "General administrative support" }
];

async function createDefaultPositions() {
  try {
    // Connect to database
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get admin user to link positions
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.log("❌ No admin user found. Please run seed:admin first");
      process.exit(1);
    }

    // Check existing positions
    const existingCount = await Position.countDocuments();
    if (existingCount > 0) {
      console.log(`ℹ️  ${existingCount} position(s) already exist. Skipping...`);
      process.exit(0);
    }

    // Create positions
    for (const pos of defaultPositions) {
      const position = new Position({
        ...pos,
        createdBy: admin._id
      });
      await position.save();
      console.log(`✅ Created position: ${pos.title}`);
    }

    console.log(`\n✅ Successfully created ${defaultPositions.length} default positions`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating positions:", error);
    process.exit(1);
  }
}

createDefaultPositions();

