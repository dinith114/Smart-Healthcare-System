const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Patient = require("../models/Patient");
const User = require("../models/userModel");
const HealthCard = require("../models/HealthCard");
const AuditLog = require("../models/AuditLog");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const QR_TOKEN_EXPIRY = "30d"; // QR tokens valid for 30 days

/**
 * Generate a secure QR token for a patient
 * @route POST /api/qr/generate-token
 */
exports.generateQRToken = async (req, res) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Generate secure token
    const token = jwt.sign(
      {
        patientId: patient._id.toString(),
        type: "qr-verification",
        iat: Date.now(),
      },
      JWT_SECRET,
      { expiresIn: QR_TOKEN_EXPIRY }
    );

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-health-card/${token}`;

    res.json({
      success: true,
      token,
      verificationUrl,
      expiresIn: QR_TOKEN_EXPIRY,
    });
  } catch (error) {
    console.error("Generate QR token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate QR token",
    });
  }
};

/**
 * Get patient name from QR token (non-sensitive info for display)
 * @route GET /api/qr/patient-info/:token
 */
exports.getPatientInfoFromToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    // Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "QR code has expired. Please request a new one.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid QR code",
      });
    }

    if (decoded.type !== "qr-verification") {
      return res.status(401).json({
        success: false,
        message: "Invalid token type",
      });
    }

    // Get patient basic info (non-sensitive)
    const patient = await Patient.findById(decoded.patientId).select("name");
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({
      success: true,
      patientName: patient.name,
      patientId: decoded.patientId,
    });
  } catch (error) {
    console.error("Get patient info error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve patient information",
    });
  }
};

/**
 * Verify password and return health card data
 * @route POST /api/qr/verify
 */
exports.verifyQRAccess = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required",
      });
    }

    // Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Log failed attempt
      await AuditLog.create({
        actorId: "anonymous",
        action: "QRVerificationFailed",
        meta: { reason: "Invalid or expired token", timestamp: new Date() },
      });

      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "QR code has expired. Please request a new one.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid QR code",
      });
    }

    if (decoded.type !== "qr-verification") {
      return res.status(401).json({
        success: false,
        message: "Invalid token type",
      });
    }

    // Get patient and associated user account
    const patient = await Patient.findById(decoded.patientId);
    if (!patient) {
      await AuditLog.create({
        actorId: "anonymous",
        action: "QRVerificationFailed",
        meta: { reason: "Patient not found", patientId: decoded.patientId },
      });

      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Get user account to verify password
    const user = await User.findById(patient.userId);
    if (!user) {
      await AuditLog.create({
        actorId: decoded.patientId,
        action: "QRVerificationFailed",
        meta: { reason: "User account not found" },
      });

      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Log failed password attempt
      await AuditLog.create({
        actorId: decoded.patientId,
        action: "QRVerificationFailed",
        meta: { reason: "Invalid password", timestamp: new Date() },
      });

      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Get health card
    const healthCard = await HealthCard.findOne({ patientId: decoded.patientId });
    
    // Log successful access
    await AuditLog.create({
      actorId: decoded.patientId,
      action: "QRVerificationSuccess",
      meta: {
        accessedAt: new Date(),
        accessMethod: "QR Code",
      },
    });

    // Create a session token for the verification (valid for 30 minutes)
    const sessionToken = jwt.sign(
      {
        patientId: decoded.patientId,
        type: "qr-session",
        iat: Date.now(),
      },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    // Return patient data
    res.json({
      success: true,
      sessionToken,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dob: patient.dob,
        gender: patient.gender,
        address: patient.address,
        nic: patient.nic,
      },
      healthCard: healthCard ? {
        cardNumber: healthCard.cardNumber,
        qrCodeImage: healthCard.qrCodeImage,
        issuedDate: healthCard.issuedDate,
        expiryDate: healthCard.expiryDate,
      } : null,
      message: "Access granted",
    });
  } catch (error) {
    console.error("QR verification error:", error);
    
    // Log error
    await AuditLog.create({
      actorId: "system",
      action: "QRVerificationError",
      meta: { error: error.message },
    }).catch(() => {}); // Don't fail if audit log fails

    res.status(500).json({
      success: false,
      message: "Verification failed. Please try again.",
    });
  }
};

/**
 * Validate session token and return basic info
 * @route GET /api/qr/validate-session
 */
exports.validateSession = async (req, res) => {
  try {
    const { sessionToken } = req.query;

    if (!sessionToken) {
      return res.status(400).json({
        success: false,
        message: "Session token is required",
      });
    }

    // Verify session token
    let decoded;
    try {
      decoded = jwt.verify(sessionToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid",
      });
    }

    if (decoded.type !== "qr-session") {
      return res.status(401).json({
        success: false,
        message: "Invalid session type",
      });
    }

    res.json({
      success: true,
      patientId: decoded.patientId,
      valid: true,
    });
  } catch (error) {
    console.error("Validate session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate session",
    });
  }
};

