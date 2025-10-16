const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

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
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await user.validatePassword(password);
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
