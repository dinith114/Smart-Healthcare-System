// Get all saved cards (unique by last4 and cardOwner)
exports.getSavedCards = async (req, res) => {
  try {
    // Find all payments with card info
    const payments = await require("../../models/payment/paymentModel").find({ "card.last4": { $exists: true } });
    // Map to card info and filter unique by last4+cardOwner
    const seen = new Set();
    const cards = payments
      .map(p => ({
        cardOwner: p.card.cardOwner,
        last4: p.card.last4,
        encryptedNumber: p.card.encryptedNumber,
        expiryMM: p.card.expiryMM,
        expiryYY: p.card.expiryYY,
      }))
      .filter(c => {
        const key = c.cardOwner + c.last4;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    res.json({ success: true, cards });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch saved cards" });
  }
};
const { validateCard } = require("../../utils/payment/validateCard");
const Payment = require("../../models/payment/paymentModel");
const crypto = require("crypto");

// Encryption key (in production, use environment variable)
const ENCRYPTION_KEY = process.env.CARD_ENCRYPTION_KEY || "12345678901234567890123456789012"; // 32 chars
const IV_LENGTH = 16;

// Function to encrypt card number
function encryptCardNumber(cardNumber) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(cardNumber);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// Function to decrypt card number
function decryptCardNumber(encryptedData) {
  const parts = encryptedData.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = Buffer.from(parts[1], "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Delete saved card from all matching payment documents
exports.deleteSavedCard = async (req, res) => {
  try {
    const { cardOwner, last4, expiryMM, expiryYY } = req.body || {};
    if (!cardOwner || !last4 || !expiryMM || !expiryYY) {
      return res.status(400).json({
        success: false,
        message: "cardOwner, last4, expiryMM, and expiryYY are required",
      });
    }

    const query = {
      "card.cardOwner": cardOwner,
      "card.last4": last4,
      "card.expiryMM": expiryMM,
      "card.expiryYY": expiryYY,
    };

    const result = await Payment.updateMany(query, { $unset: { card: "" } });

    return res.json({
      success: true,
      message: result.modifiedCount > 0 ? "Saved card removed" : "No matching saved cards found",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Delete saved card error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete saved card" });
  }
};

exports.makePayment = async (req, res) => {
  try {
    const { card, amount, saveCard } = req.body;

    console.log("Payment request received:", { card: { ...card, cardNumber: card?.cardNumber?.slice(-4) }, amount, saveCard });

    // Validate required fields
    if (!card || !amount) {
      console.log("Validation failed: Missing card or amount");
      return res.status(400).json({
        success: false,
        message: "Card details and amount are required",
      });
    }

    // Validate card details
    if (!validateCard(card)) {
      console.log("Validation failed: Invalid card details");
      return res.status(400).json({
        success: false,
        message: "Invalid card details. Please check your card information.",
      });
    }
    // Validate expiry date is in the future
    const now = new Date();
    const expMonth = parseInt(card.expiryMM, 10);
    const expYear = parseInt(card.expiryYY, 10) + 2000;
    const expDate = new Date(expYear, expMonth - 1, 1);
    expDate.setMonth(expDate.getMonth() + 1); // End of expiry month
    if (isNaN(expMonth) || isNaN(expYear) || expDate <= now) {
      return res.status(400).json({
        success: false,
        message: "Card expiry date must be in the future.",
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    // Simulate payment processing
    // In a real application, you would integrate with a payment gateway here
    // (e.g., Stripe, PayPal, etc.)

    // Simulate random payment failure for testing (10% chance)
    const shouldFail = Math.random() < 0.1;
    
    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    if (shouldFail) {
      // Save failed payment to database (store card only if explicitly requested)
      const failedPaymentData = {
        amount,
        method: "Card",
        status: "Failed",
        transactionId,
        details: {
          reason: "Payment declined by bank",
        },
      };
      if (saveCard) {
        failedPaymentData.card = {
          cardOwner: card.cardOwner,
          last4: card.cardNumber.slice(-4),
          encryptedNumber: encryptCardNumber(card.cardNumber),
          expiryMM: card.expiryMM,
          expiryYY: card.expiryYY,
        };
      }
      const failedPayment = new Payment(failedPaymentData);
      await failedPayment.save();
      return res.status(400).json({
        success: false,
        message: "Payment declined by bank. Please try again or use a different card.",
      });
    }

    // Payment successful - Save to database (store card only if explicitly requested)
    const paymentData = {
      amount,
      method: "Card",
      status: "Success",
      transactionId,
      details: {
        appointmentInfo: "Dr Kusalya Widanagama - X-Ray Scanning",
      },
    };
    if (saveCard) {
      paymentData.card = {
        cardOwner: card.cardOwner,
        last4: card.cardNumber.slice(-4),
        encryptedNumber: encryptCardNumber(card.cardNumber),
        expiryMM: card.expiryMM,
        expiryYY: card.expiryYY,
      };
    }
    const payment = new Payment(paymentData);
    await payment.save();
    console.log("Payment saved to database:", payment._id);

    // If saveCard is true, you would save the card details to database
    // (Remember to encrypt sensitive data and follow PCI compliance)

    return res.status(200).json({
      success: true,
      message: "Payment successful!",
      data: {
        transactionId: payment.transactionId,
        amount: payment.amount,
        cardLast4: payment.card ? payment.card.last4 : undefined,
        timestamp: payment.createdAt,
        status: payment.status,
        paymentId: payment._id,
      },
    });

  } catch (error) {
    console.error("Payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment processing failed. Please try again later.",
    });
  }
};

// Decrypt card number endpoint
exports.decryptCard = async (req, res) => {
  try {
    const { encryptedNumber } = req.body;
    
    if (!encryptedNumber) {
      return res.status(400).json({
        success: false,
        message: "Encrypted card number is required",
      });
    }
    
    const cardNumber = decryptCardNumber(encryptedNumber);
    
    res.json({
      success: true,
      cardNumber: cardNumber,
    });
  } catch (error) {
    console.error("Decryption error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to decrypt card number",
    });
  }
};
