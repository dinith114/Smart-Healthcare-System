const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1h";

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    // optional: only allow setting certain roles via admin or disabled in public
    const user = new User({ username, role });
    await user.setPassword(password);
    await user.save();
    return res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('[LOGIN] Attempt for:', JSON.stringify(username), 'pw length:', password?.length);
    console.log('[LOGIN] Searching with query:', { username });
    const user = await User.findOne({ username });
    console.log('[LOGIN] Query result:', user ? 'FOUND' : 'NOT FOUND');
    if (user) {
      console.log('[LOGIN] User details:', { _id: user._id, username: user.username, role: user.role, status: user.status });
    }
    if (!user) {
      console.log('[LOGIN] User not found');
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log('[LOGIN] User found:', user.username, 'status:', user.status);

    // Check if user account is active
    if (user.status === "INACTIVE") {
      console.log('[LOGIN] User inactive');
      return res.status(403).json({ message: "Your account has been deactivated. Please contact the administrator." });
    }

    const valid = await user.validatePassword(password);
    console.log('[LOGIN] Password valid:', valid);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    // create token payload
    const payload = {
      userId: user._id,
      role: user.role,
      username: user.username
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// GET /api/users/doctors
exports.listDoctors = async (_req, res) => {
  try {
    // Active staff whose position is "Doctor"
    const staffDocs = await Staff.find({ position: "Doctor", status: "ACTIVE" })
      .populate("userId", "username status");

    const doctors = staffDocs
      .filter(s => s.userId && s.userId.status !== "INACTIVE")
      .map(s => ({
        _id: s.userId._id,           // use User _id for appointments
        username: s.userId.username, // display name/username
        specialty: s.specialty || "",// <-- key your frontend expects
        position: s.position,        // "Doctor"
        email: s.email,
      }));

    res.json(doctors);
  } catch (err) {
    console.error("listDoctors error:", err);
    res.status(500).json({ message: "Failed to load doctors" });
  }
};
