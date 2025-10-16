const { Schema, model } = require("mongoose");

const HealthCardSchema = new Schema({
  cardNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
    unique: true
  },
  qrCodeData: {
    type: String,
    required: true
  },
  qrCodeImage: {
    type: String,
    required: true
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["ACTIVE", "REVOKED"],
    default: "ACTIVE"
  },
  lastScanned: {
    type: Date
  }
}, { timestamps: true });

module.exports = model("HealthCard", HealthCardSchema);

