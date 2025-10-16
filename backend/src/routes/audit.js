const express = require("express");
const {
  getAuditLogs,
} = require("../controllers/medicalRecords/auditController");
const { requireAccess } = require("../middleware/rbac");

const router = express.Router(); // Base: /api/audit
router.get("/:patientId", requireAccess("VIEW"), getAuditLogs);

module.exports = router;
