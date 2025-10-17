const mongoose = require("mongoose");

const insurancePaymentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  policyNumber: { type: String, required: true },
  provider: { type: String, required: true },
  insuredName: { type: String, required: true },
  amount: { type: Number, required: false },
  status: { type: String, enum: ["Success", "Failed", "Pending"], default: "Pending" },
  transactionId: { type: String, unique: true },
  details: {
    appointmentInfo: {
      appointmentId: { type: String, default: "" },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "LKR" },
    },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("InsurancePayment", insurancePaymentSchema);
