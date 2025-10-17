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
const { sendPaymentReceipt } = require("../../services/emailService");
const User = require("../../models/userModel");

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
  const { card, amount, saveCard, patientId, appointmentId, appointmentInfo } = req.body;

  // Validate required fields
  if (!card || !amount) {
    return res.status(400).json({
      success: false,
      message: "Card details and amount are required",
    });
  }
  if (!validateCard(card)) {
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
  expDate.setMonth(expDate.getMonth() + 1);
  if (isNaN(expMonth) || isNaN(expYear) || expDate <= now) {
    return res.status(400).json({
      success: false,
      message: "Card expiry date must be in the future.",
    });
  }
  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment amount",
    });
  }

  // Simulate payment processing
  const shouldFail = Math.random() < 0.1;
  const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

  // Prepare appointment info for DB (only required fields)
  const appointmentDetails = {
    appointmentId: appointmentId || appointmentInfo?.appointmentId || "",
    amount: appointmentInfo?.amount || amount,
    currency: appointmentInfo?.currency || "LKR",
  };

  if (shouldFail) {
    const failedPaymentData = {
      amount,
      method: "Card",
      status: "Failed",
      transactionId,
      patientId,
      appointmentId,
      details: {
        appointmentInfo: appointmentDetails,
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

  // Payment successful - Save to database
  const paymentData = {
    amount: appointmentDetails.amount,
    method: "Card",
    status: "Success",
    transactionId,
    patientId,
    appointmentId,
    details: {
      appointmentInfo: appointmentDetails,
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

  // Send payment receipt email
  try {
    if (patientId) {
      const patient = await User.findById(patientId);
      if (patient && patient.email) {
        await sendPaymentReceipt({
          to: patient.email,
          patientName: patient.username || patient.name || "Patient",
          transactionId: payment.transactionId,
          amount: payment.amount,
          currency: appointmentDetails.currency,
          appointmentId: appointmentDetails.appointmentId,
          doctorName: appointmentInfo?.doctorName || "N/A",
          specialty: appointmentInfo?.specialty || appointmentInfo?.type || "N/A",
          appointmentDate: appointmentInfo?.isoDate || "",
          paymentMethod: "Card",
          cardLast4: payment.card ? payment.card.last4 : undefined,
        });
      }
    }
  } catch (emailError) {
    console.error("Failed to send payment receipt email:", emailError);
    // Don't fail the payment if email fails
  }

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
