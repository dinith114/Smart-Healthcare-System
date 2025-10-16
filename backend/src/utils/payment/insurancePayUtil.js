// Utility functions for insurance payment (validation, etc.)

function validateInsurancePayment({ policyNumber, provider, insuredName }) {
  if (!policyNumber || !provider || !insuredName) return false;
  // Add more validation as needed
  return true;
}

module.exports = { validateInsurancePayment };
