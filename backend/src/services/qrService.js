// backend/src/services/qrService.js
// Node 22+ compatible QR crypto using AES-256-CBC (createCipheriv)

const QRCode = require("qrcode");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const QR_TOKEN_EXPIRY = "30d"; // QR tokens valid for 30 days

// Use a strong secret (32 bytes derived via SHA-256)
const QR_SECRET =
  process.env.QR_SECRET ||
  process.env.ENCRYPTION_KEY ||
  "default-qr-secret-change-this";

// Derive a 32-byte key from the secret
function getKey() {
  return crypto.createHash("sha256").update(String(QR_SECRET)).digest(); // Buffer(32)
}

// Encrypts a JS object -> token string "ivHex.cipherHex"
function encryptData(data) {
  const json = JSON.stringify(data);
  const key = getKey();
  const iv = crypto.randomBytes(16); // 16 bytes for AES-CBC

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);

  // keep hex style similar to your previous code, but include IV
  return `${iv.toString("hex")}.${encrypted.toString("hex")}`;
}

// Decrypts token "ivHex.cipherHex" -> JS object
function decryptData(token) {
  try {
    const [ivHex, dataHex] = String(token).split(".");
    if (!ivHex || !dataHex) throw new Error("Malformed token");

    const key = getKey();
    const iv = Buffer.from(ivHex, "hex");
    const enc = Buffer.from(dataHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    const decrypted = Buffer.concat([decipher.update(enc), decipher.final()]);

    return JSON.parse(decrypted.toString("utf8"));
  } catch (err) {
    throw new Error("Invalid or corrupted QR token");
  }
}

/**
 * Generate QR with JWT token that links to verification page
 * @param {Object} cardData { patientId, cardNumber, issuedDate }
 * @returns {Promise<{qrCodeData:string, qrCodeImage:string, verificationUrl:string}>}
 */
async function generateQRCode(cardData) {
  try {
    // Generate secure JWT token
    const token = jwt.sign(
      {
        patientId: cardData.patientId,
        cardNumber: cardData.cardNumber,
        type: "qr-verification",
        iat: Date.now(),
      },
      JWT_SECRET,
      { expiresIn: QR_TOKEN_EXPIRY }
    );

    // Create verification URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verificationUrl = `${frontendUrl}/verify-health-card/${token}`;

    // Generate QR code with the verification URL
    const qrCodeImage = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "H",
      width: 300,
      margin: 2,
      color: { dark: "#2d3b2b", light: "#ffffff" },
    });

    return { 
      qrCodeData: token, 
      qrCodeImage,
      verificationUrl 
    };
  } catch (error) {
    console.error("QR code generation error:", error);
    throw new Error("Failed to generate QR code");
  }
}

// Verify token from QR scan -> original object
function verifyQRToken(token) {
  return decryptData(token);
}

module.exports = {
  generateQRCode,
  verifyQRToken,
  encryptData,
  decryptData,
};
