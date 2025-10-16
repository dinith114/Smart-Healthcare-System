/**
 * Validate Sri Lankan NIC format
 * Old format: 9 digits + V (e.g., 123456789V)
 * New format: 12 digits (e.g., 200012345678)
 * @param {string} nic - NIC to validate
 * @returns {boolean} true if valid
 */
function validateNIC(nic) {
  if (!nic || typeof nic !== 'string') {
    return false;
  }
  
  const trimmedNIC = nic.trim().toUpperCase();
  
  // Old format: 9 digits followed by 'V' or 'X'
  const oldFormatRegex = /^[0-9]{9}[VX]$/;
  
  // New format: exactly 12 digits
  const newFormatRegex = /^[0-9]{12}$/;
  
  return oldFormatRegex.test(trimmedNIC) || newFormatRegex.test(trimmedNIC);
}

module.exports = { validateNIC };

