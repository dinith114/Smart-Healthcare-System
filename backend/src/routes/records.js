const express = require("express");
const {
  getRecords,
  addEncounter,
} = require("../controllers/medicalRecords/recordsController");
const { requireAccess } = require("../middleware/rbac");

const router = express.Router(); // Base: /api/records
router.get("/:patientId", requireAccess("VIEW"), getRecords);
router.post("/:patientId/encounters", requireAccess("UPDATE"), addEncounter);

module.exports = router;
