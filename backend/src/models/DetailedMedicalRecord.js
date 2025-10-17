const mongoose = require("mongoose");

const detailedMedicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    // Provider who created this record
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    providerName: {
      type: String,
      required: true,
    },
    providerRole: {
      type: String,
      default: "Provider",
    },
    // Main note/reason for the record
    note: {
      type: String,
      required: true,
    },
    // Vital signs at the time of record
    vitals: {
      heartRate: { type: Number },
      weightKg: { type: Number },
      temperatureC: { type: Number },
      oxygenSat: { type: Number },
    },
    // Medications prescribed or recorded
    medications: [
      {
        type: String,
      },
    ],
    // Lab results
    labs: [
      {
        type: String,
      },
    ],
    // Visit history entry
    visits: [
      {
        date: { type: Date },
        reason: { type: String },
        doctor: { type: String },
        summary: { type: String },
      },
    ],
    // Immunization records
    immunizations: [
      {
        name: { type: String },
        by: { type: String },
        note: { type: String },
      },
    ],
    // Record status
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
detailedMedicalRecordSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model(
  "DetailedMedicalRecord",
  detailedMedicalRecordSchema
);
