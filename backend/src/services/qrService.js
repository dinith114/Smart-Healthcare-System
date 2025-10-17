const QRCode = require("qrcode");
const crypto = require("crypto");

const QR_SECRET = process.env.QR_SECRET || "default-qr-secret-change-this";

/**
 * Encrypt data for QR code
 * @param {Object} data - Data to encrypt
 * @returns {string} Encrypted token
 */
function encryptData(data) {
  const jsonString = JSON.stringify(data);
  const cipher = crypto.createCipher("aes-256-cbc", QR_SECRET);
  let encrypted = cipher.update(jsonString, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

/**
 * Decrypt QR code token
 * @param {string} token - Encrypted token
 * @returns {Object} Decrypted data
 */
function decryptData(token) {
  try {
    const decipher = crypto.createDecipher("aes-256-cbc", QR_SECRET);
    let decrypted = decipher.update(token, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error("Invalid or corrupted QR token");
  }
}

/**
 * Generate QR code with encrypted token
 * @param {Object} cardData - Card data to encode
 * @param {string} cardData.patientId - Patient ID
 * @param {string} cardData.cardNumber - Card number
 * @param {Date} cardData.issuedDate - Issue date
 * @returns {Promise<Object>} { qrCodeData: encrypted token, qrCodeImage: base64 image }
 */
async function generateQRCode(cardData) {
  try {
    // Create encrypted token
    const dataToEncrypt = {
      patientId: cardData.patientId,
      cardNumber: cardData.cardNumber,
      issuedDate: cardData.issuedDate,
      timestamp: Date.now()
    };
    
    const encryptedToken = encryptData(dataToEncrypt);
    
    // Generate QR code image as base64
    const qrCodeImage = await QRCode.toDataURL(encryptedToken, {
      errorCorrectionLevel: "H",
      width: 300,
      margin: 2,
      color: {
        dark: "#2d3b2b",
        light: "#ffffff"
      }
    });
    
    return {
      qrCodeData: encryptedToken,
      qrCodeImage
    };
  } catch (error) {
    console.error("QR code generation error:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Verify QR code token
 * @param {string} token - Encrypted token from QR scan
 * @returns {Object} Decrypted card data
 */
function verifyQRToken(token) {
  return decryptData(token);
}

module.exports = {
  generateQRCode,
  verifyQRToken,
  encryptData,
  decryptData
};

