const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const JWT_SECRET = process.env.JWT_SECRET;

exports.authenticate = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = auth.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // attach user info to request
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      username: decoded.username
    };
    // optional: you might load full user document if needed
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
