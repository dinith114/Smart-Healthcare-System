const express = require("express");
const {
  uploadAvatar,
  deleteAvatar,
} = require("../controllers/avatarController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Base URL: /api/patients/:patientId/avatar

// Upload avatar (accessible by patient themselves or staff)
router.post("/:patientId/avatar", authenticate, uploadAvatar);

// Delete avatar
router.delete("/:patientId/avatar", authenticate, deleteAvatar);

module.exports = router;
