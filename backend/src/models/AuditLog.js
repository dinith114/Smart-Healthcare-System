const { Schema, model, Types } = require("mongoose");

const AuditLogSchema = new Schema(
  {
    patientId: {
      type: Types.ObjectId,
      ref: "Patient",
      index: true,
      required: true,
    },
    actorId: { type: Types.ObjectId, required: true },
    actorRole: {
      type: String,
      enum: ["Patient", "Provider", "Admin"],
      required: true,
    },
    action: { type: String, enum: ["VIEW", "UPDATE"], required: true },
    details: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = model("AuditLog", AuditLogSchema);
