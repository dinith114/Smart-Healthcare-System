const express = require("express");
const router = express.Router();
const {
  generateQRToken,
  getPatientInfoFromToken,
  verifyQRAccess,
  validateSession,
} = require("../controllers/qrVerificationController");

// Generate QR token for a patient (used during registration/card issuance)
router.post("/generate-token", generateQRToken);

// Get patient name from token (non-sensitive, for display before password entry)
router.get("/patient-info/:token", getPatientInfoFromToken);

// Verify password and grant access to health card
router.post("/verify", verifyQRAccess);

// Validate session token
router.get("/validate-session", validateSession);

module.exports = router;

