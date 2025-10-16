const mongoose = require("mongoose");

const VisitSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    reason: String,
    doctor: String,
    summary: String,
  },
  { _id: false }
);

const ImmunizationSchema = new mongoose.Schema(
  {
    name: String,
    by: String,
    note: String,
  },
  { _id: false }
);

const PatientSummarySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      index: true,
      unique: true,
    },
    vitals: {
      heartRate: Number,
      weightKg: Number,
      temperatureC: Number,
      oxygenSat: Number,
    },
    medications: [String],
    labs: [String],
    visits: [VisitSchema],
    immunizations: [ImmunizationSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("PatientSummary", PatientSummarySchema);
