const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  cardOwner: String,
  last4: String,
  encryptedNumber: String,
  expiryMM: String,
  expiryYY: String,
  token: String, // tokenized card data
});

const paymentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["Card", "Insurance"], default: "Card" },
  status: { type: String, enum: ["Success", "Failed", "Pending"], default: "Pending" },
  transactionId: { type: String, unique: true },
  details: Object,
  card: cardSchema,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);
