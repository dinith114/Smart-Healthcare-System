const express = require("express");
const {
  getProfile,
  getHealthCard,
  updateProfile
} = require("../controllers/patientController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// All routes require authentication and patient role
router.use(authenticate);
router.use(authorize(["patient"]));

// Profile management
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Health card
router.get("/health-card", getHealthCard);

module.exports = router;

