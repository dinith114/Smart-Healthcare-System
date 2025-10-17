// backend/src/routes/userRoutes.js
const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const User = require("../models/userModel");
const Staff = require("../models/Staff");

const router = express.Router();

// keep this if you want only logged-in users to fetch doctors
router.use(authenticate);

// Existing: generic user listing (still works)
router.get("/", async (req, res) => {
  const { role } = req.query;
  const q = role ? { role } : {};
  const users = await User.find(q).select("_id username role specialty");
  res.json(users);
});

// NEW: specific endpoint to list doctors with specialty (from Staff)
router.get("/doctors", async (_req, res) => {
  try {
    const staffDocs = await Staff.find({ position: "Doctor", status: "ACTIVE" })
      .populate("userId", "username status");

    const doctors = staffDocs
      .filter(s => s.userId && s.userId.status !== "INACTIVE")
      .map(s => ({
        _id: s.userId._id,            // use User id for appointments
        username: s.userId.username,  // display name/username
        specialty: s.specialty || "", // from Staff.specialty
        position: s.position,         // "Doctor"
        email: s.email,
      }));

    res.json(doctors);
  } catch (err) {
    console.error("listDoctors error:", err);
    res.status(500).json({ message: "Failed to load doctors" });
  }
});

module.exports = router;
