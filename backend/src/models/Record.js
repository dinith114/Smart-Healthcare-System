const { Schema, model, Types } = require("mongoose");

const EncounterSchema = new Schema(
  {
    note: { type: String, required: true, trim: true },
    authorRole: { type: String, enum: ["Provider", "Patient"], required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const RecordSchema = new Schema(
  {
    patientId: {
      type: Types.ObjectId,
      ref: "Patient",
      index: true,
      required: true,
    },
    encounters: { type: [EncounterSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = model("Record", RecordSchema);
