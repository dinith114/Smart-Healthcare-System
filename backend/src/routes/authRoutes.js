const express = require("express");
const { register, login } = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// public routes
router.post("/register", register);
router.post("/login", login);

// example protected route (test)
router.get("/protected", authenticate, authorize(["admin","doctor"]), (req, res) => {
  res.json({ msg: `Hello ${req.user.username}, role = ${req.user.role}` });
});

module.exports = router;
