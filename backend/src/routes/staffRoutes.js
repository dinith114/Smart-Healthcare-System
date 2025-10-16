const express = require("express");
const {
  registerPatient,
  getPatients,
  getPatientDetails,
  updatePatient
} = require("../controllers/staffController");
const {
  getCardByPatientId,
  regenerateCard
} = require("../controllers/healthCardController");
const {
  getStaffProfile,
  updateStaffProfile
} = require("../controllers/profileController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// All routes require authentication and staff role
router.use(authenticate);
router.use(authorize(["staff"]));

// Profile
router.get("/profile", getStaffProfile);
router.put("/profile", updateStaffProfile);

// Patient management
router.post("/patients", registerPatient);
router.get("/patients", getPatients);
router.get("/patients/:patientId", getPatientDetails);
router.put("/patients/:patientId", updatePatient);

// Health card operations
router.get("/patients/:patientId/health-card", getCardByPatientId);
router.post("/patients/:patientId/regenerate-card", regenerateCard);

module.exports = router;

