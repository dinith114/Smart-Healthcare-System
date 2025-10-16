const mongoose = require("mongoose");

const insurancePaymentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  policyNumber: { type: String, required: true },
  provider: { type: String, required: true },
  insuredName: { type: String, required: true },
  amount: { type: Number, required: false },
  status: { type: String, enum: ["Success", "Failed", "Pending"], default: "Pending" },
  transactionId: { type: String, unique: true },
  details: Object,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("InsurancePayment", insurancePaymentSchema);
