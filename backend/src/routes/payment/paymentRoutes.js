const express = require("express");
const router = express.Router();
const { makePayment, getSavedCards, decryptCard, deleteSavedCard } = require("../../controllers/payment/paymentController");

// Get all saved cards
router.get("/saved-cards", getSavedCards);

// Decrypt card number
router.post("/decrypt-card", decryptCard);

// Delete saved card (by identity)
router.delete("/saved-cards", deleteSavedCard);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Payment routes working!" });
});

router.post("/make-payment", makePayment);

module.exports = router;
