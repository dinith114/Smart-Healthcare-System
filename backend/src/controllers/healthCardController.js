const HealthCard = require("../models/HealthCard");
const Patient = require("../models/Patient");
const { verifyQRToken } = require("../services/qrService");
const { generateCardNumber } = require("../utils/cardNumberGenerator");
const { generateQRCode } = require("../services/qrService");

/**
 * Verify QR code token (public endpoint)
 */
exports.verifyCard = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Decrypt and verify token
    const decryptedData = verifyQRToken(token);

    // Fetch health card from database
    const healthCard = await HealthCard.findOne({
      cardNumber: decryptedData.cardNumber
    }).populate({
      path: "patientId",
      select: "name nic email phone status"
    });

    if (!healthCard) {
      return res.status(404).json({ 
        valid: false, 
        message: "Health card not found" 
      });
    }

    if (healthCard.status !== "ACTIVE") {
      return res.status(403).json({ 
        valid: false, 
        message: "This health card has been revoked" 
      });
    }

    // Update last scanned timestamp
    healthCard.lastScanned = new Date();
    await healthCard.save();

    res.json({
      valid: true,
      cardNumber: healthCard.cardNumber,
      patient: {
        name: healthCard.patientId.name,
        nic: healthCard.patientId.nic,
        status: healthCard.patientId.status
      },
      issuedDate: healthCard.issuedDate,
      lastScanned: healthCard.lastScanned
    });
  } catch (error) {
    console.error("Verify card error:", error);
    res.status(400).json({ 
      valid: false, 
      message: "Invalid or corrupted QR code" 
    });
  }
};

/**
 * Regenerate health card (for staff when card is lost)
 */
exports.regenerateCard = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Revoke old card
    await HealthCard.findOneAndUpdate(
      { patientId: patient._id },
      { status: "REVOKED" }
    );

    // Generate new card
    const cardNumber = await generateCardNumber();
    const { qrCodeData, qrCodeImage } = await generateQRCode({
      patientId: patient._id.toString(),
      cardNumber,
      issuedDate: new Date()
    });

    const newHealthCard = new HealthCard({
      cardNumber,
      patientId: patient._id,
      qrCodeData,
      qrCodeImage
    });
    await newHealthCard.save();

    res.json({
      message: "Health card regenerated successfully",
      healthCard: {
        cardNumber,
        qrCodeImage,
        issuedDate: newHealthCard.issuedDate
      }
    });
  } catch (error) {
    console.error("Regenerate card error:", error);
    res.status(500).json({ message: "Failed to regenerate health card" });
  }
};

/**
 * Get health card by patient ID (for staff)
 */
exports.getCardByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    const healthCard = await HealthCard.findOne({ patientId })
      .populate({
        path: "patientId",
        select: "name nic phone email"
      });

    if (!healthCard) {
      return res.status(404).json({ message: "Health card not found" });
    }

    res.json({
      cardNumber: healthCard.cardNumber,
      patient: {
        name: healthCard.patientId.name,
        nic: healthCard.patientId.nic,
        phone: healthCard.patientId.phone,
        email: healthCard.patientId.email
      },
      qrCodeImage: healthCard.qrCodeImage,
      issuedDate: healthCard.issuedDate,
      status: healthCard.status,
      lastScanned: healthCard.lastScanned
    });
  } catch (error) {
    console.error("Get card error:", error);
    res.status(500).json({ message: "Failed to fetch health card" });
  }
};

