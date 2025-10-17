const DetailedMedicalRecord = require("../../models/DetailedMedicalRecord");
const Patient = require("../../models/Patient");

/**
 * Create a new detailed medical record
 */
exports.createDetailedRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      note,
      vitals,
      medications,
      labs,
      visits,
      immunizations,
      providerName,
      providerRole,
    } = req.body;

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Get provider ID from auth (or use demo ID)
    const providerId =
      req.user?.id || req.auth?.actorId || "000000000000000000000999";

    // Create the detailed record
    const record = new DetailedMedicalRecord({
      patientId,
      providerId,
      providerName: providerName || req.user?.username || "Provider",
      providerRole: providerRole || req.auth?.role || "Provider",
      note: note || "Medical report added",
      vitals: vitals || {},
      medications: medications || [],
      labs: labs || [],
      visits: visits || [],
      immunizations: immunizations || [],
    });

    await record.save();

    res.status(201).json({
      message: "Detailed medical record created successfully",
      record,
    });
  } catch (error) {
    console.error("Error creating detailed record:", error);
    res.status(500).json({ error: "Failed to create detailed medical record" });
  }
};

/**
 * Get all detailed medical records for a patient
 */
exports.getDetailedRecords = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Fetch records sorted by most recent first
    const records = await DetailedMedicalRecord.find({
      patientId,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Error fetching detailed records:", error);
    res.status(500).json({ error: "Failed to fetch detailed medical records" });
  }
};

/**
 * Get a single detailed medical record by ID
 */
exports.getDetailedRecordById = async (req, res) => {
  try {
    const { patientId, recordId } = req.params;

    const record = await DetailedMedicalRecord.findOne({
      _id: recordId,
      patientId,
      status: "active",
    }).lean();

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json(record);
  } catch (error) {
    console.error("Error fetching detailed record:", error);
    res.status(500).json({ error: "Failed to fetch detailed medical record" });
  }
};

/**
 * Update a detailed medical record
 */
exports.updateDetailedRecord = async (req, res) => {
  try {
    const { patientId, recordId } = req.params;
    const updates = req.body;

    // Don't allow changing patientId or providerId
    delete updates.patientId;
    delete updates.providerId;

    const record = await DetailedMedicalRecord.findOneAndUpdate(
      { _id: recordId, patientId, status: "active" },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({
      message: "Record updated successfully",
      record,
    });
  } catch (error) {
    console.error("Error updating detailed record:", error);
    res.status(500).json({ error: "Failed to update detailed medical record" });
  }
};

/**
 * Delete (archive) a detailed medical record
 */
exports.deleteDetailedRecord = async (req, res) => {
  try {
    const { patientId, recordId } = req.params;

    const record = await DetailedMedicalRecord.findOneAndUpdate(
      { _id: recordId, patientId },
      { $set: { status: "deleted" } },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({
      message: "Record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting detailed record:", error);
    res.status(500).json({ error: "Failed to delete detailed medical record" });
  }
};
