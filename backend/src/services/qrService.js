// backend/src/services/qrService.js
// Node 22+ compatible QR crypto using AES-256-CBC (createCipheriv)

const QRCode = require("qrcode");
const crypto = require("crypto");

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
 * Generate QR with encrypted token
 * @param {Object} cardData { patientId, cardNumber, issuedDate }
 * @returns {Promise<{qrCodeData:string, qrCodeImage:string}>}
 */
async function generateQRCode(cardData) {
  try {
    const dataToEncrypt = {
      patientId: cardData.patientId,
      cardNumber: cardData.cardNumber,
      issuedDate: cardData.issuedDate,
      timestamp: Date.now(),
    };

    const encryptedToken = encryptData(dataToEncrypt);

    const qrCodeImage = await QRCode.toDataURL(encryptedToken, {
      errorCorrectionLevel: "H",
      width: 300,
      margin: 2,
      color: { dark: "#2d3b2b", light: "#ffffff" },
    });

    return { qrCodeData: encryptedToken, qrCodeImage };
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
