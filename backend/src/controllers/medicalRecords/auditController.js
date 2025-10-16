const AuditLog = require("../../models/AuditLog");

// GET /api/audit/:patientId
exports.getAuditLogs = async (req, res, next) => {
  try {
    const docs = await AuditLog.find({ patientId: req.params.patientId })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();
    res.json(docs);
  } catch (e) {
    next(e);
  }
};
