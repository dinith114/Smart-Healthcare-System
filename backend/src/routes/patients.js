const express = require("express");
const {
  getPatientSummary,
  updatePatientSummary,
} = require("../controllers/medicalRecords/patientController");
const { requireAccess } = require("../middleware/rbac");

const router = express.Router(); // Base: /api/patients
router.get("/:patientId/summary", requireAccess("VIEW"), getPatientSummary);
router.patch(
  "/:patientId/summary",
  requireAccess("UPDATE"),
  updatePatientSummary
); // <— NEW

module.exports = router;
