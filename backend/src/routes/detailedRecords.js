const express = require("express");
const {
  createDetailedRecord,
  getDetailedRecords,
  getDetailedRecordById,
  updateDetailedRecord,
  deleteDetailedRecord,
} = require("../controllers/medicalRecords/detailedRecordsController");
const { requireAccess } = require("../middleware/rbac");

const router = express.Router(); // Base: /api/detailed-records

// Create a new detailed medical record
router.post("/:patientId", requireAccess("UPDATE"), createDetailedRecord);

// Get all detailed records for a patient
router.get("/:patientId", requireAccess("VIEW"), getDetailedRecords);

// Get a single detailed record by ID
router.get(
  "/:patientId/:recordId",
  requireAccess("VIEW"),
  getDetailedRecordById
);

// Update a detailed record
router.patch(
  "/:patientId/:recordId",
  requireAccess("UPDATE"),
  updateDetailedRecord
);

// Delete (archive) a detailed record
router.delete(
  "/:patientId/:recordId",
  requireAccess("UPDATE"),
  deleteDetailedRecord
);

module.exports = router;
