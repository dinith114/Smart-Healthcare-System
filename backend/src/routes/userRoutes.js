const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const User = require("../models/userModel");

const router = express.Router();

router.use(authenticate);

// GET /api/users?role=doctor
router.get("/", async (req, res) => {
  const { role } = req.query;
  const q = role ? { role } : {};
  const users = await User.find(q).select("_id username role specialty");
  res.json(users);
});

module.exports = router;
