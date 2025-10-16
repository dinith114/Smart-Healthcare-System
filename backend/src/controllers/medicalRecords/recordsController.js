const Records = require("../../models/Record");
const AuditLog = require("../../models/AuditLog");
const { notifyPatientUpdate } = require("../../services/notificationService");

// GET /api/records/:patientId  (view records)
exports.getRecords = async (req, res, next) => {
  try {
    const rec = await Records.findOne({ patientId: req.params.patientId });
    const data = rec || { patientId: req.params.patientId, encounters: [] };

    // log VIEW audit
    await AuditLog.create({
      patientId: req.params.patientId,
      actorId: req.auth.actorId,
      actorRole: req.auth.role,
      action: "VIEW",
      details: "Viewed medical records",
    });

    res.json(data);
  } catch (e) {
    next(e);
  }
};

// POST /api/records/:patientId/encounters  (provider update)
exports.addEncounter = async (req, res, next) => {
  try {
    const { note, authorRole } = req.body;
    const trimmed = String(note || "").trim();
    if (!trimmed || trimmed.length < 3) {
      return res
        .status(400)
        .json({ error: "note must be at least 3 characters" });
    }
    if (authorRole !== "Provider") {
      return res.status(400).json({ error: "authorRole must be Provider" });
    }

    const rec = await Records.findOneAndUpdate(
      { patientId: req.params.patientId },
      { $push: { encounters: { note: trimmed, authorRole, at: new Date() } } },
      { upsert: true, new: true }
    );

    // log UPDATE audit
    await AuditLog.create({
      patientId: req.params.patientId,
      actorId: req.auth.actorId,
      actorRole: req.auth.role,
      action: "UPDATE",
      details: "Added encounter note",
    });

    // notify patient (minimal info) - ignore failures
    notifyPatientUpdate({
      patientId: req.params.patientId,
      minimal: true,
    }).catch(() => {});

    res.status(201).json(rec);
  } catch (e) {
    next(e);
  }
};
