const express = require("express");
const {
  addStaff,
  getAllStaff,
  updateStaff,
  deleteStaff,
  getAllPatients,
  getStatistics,
  addPosition,
  getAllPositions,
  updatePosition,
  deletePosition,
  updatePatientStatus
} = require("../controllers/adminController");
const {
  getAdminProfile,
  updateAdminPassword
} = require("../controllers/profileController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize(["admin"]));

// Profile
router.get("/profile", getAdminProfile);
router.put("/profile/password", updateAdminPassword);

// Statistics
router.get("/statistics", getStatistics);

// Staff management
router.post("/staff", addStaff);
router.get("/staff", getAllStaff);
router.put("/staff/:staffId", updateStaff);
router.delete("/staff/:staffId", deleteStaff);

// Position management
router.post("/positions", addPosition);
router.get("/positions", getAllPositions);
router.put("/positions/:positionId", updatePosition);
router.delete("/positions/:positionId", deletePosition);

// Patient overview and management
router.get("/patients", getAllPatients);
router.put("/patients/:patientId/change-mobile", require("../controllers/adminController").changePatientMobile);
router.put("/patients/:patientId/status", updatePatientStatus);

module.exports = router;

