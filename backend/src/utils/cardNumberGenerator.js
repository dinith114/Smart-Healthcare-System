const HealthCard = require("../models/HealthCard");

/**
 * Generate unique health card number in format HC-YYYY-NNNN
 * @returns {Promise<string>} Card number
 */
async function generateCardNumber() {
  const year = new Date().getFullYear();
  
  // Find the last card number for this year
  const lastCard = await HealthCard.findOne({
    cardNumber: new RegExp(`^HC-${year}-`)
  }).sort({ cardNumber: -1 });
  
  let sequence = 1;
  if (lastCard) {
    const match = lastCard.cardNumber.match(/HC-\d{4}-(\d{4})/);
    if (match) {
      sequence = parseInt(match[1], 10) + 1;
    }
  }
  
  // Pad sequence to 4 digits
  const paddedSequence = sequence.toString().padStart(4, '0');
  
  return `HC-${year}-${paddedSequence}`;
}

module.exports = { generateCardNumber };

