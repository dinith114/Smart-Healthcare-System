// backend/src/services/appointment/pricingService.js

// Simple specialty → fee map (Rs.)
const PRICES_BY_SPECIALTY = {
  Cardiology: 4500,
  Neurology: 5000,
  Pediatrics: 3000,
  Dermatology: 3200,
  Psychiatry: 4000,
  Orthopedics: 4200,
  General: 2000, // fallback/default
};

// Compute amount by specialty (case-sensitive match; trim optional)
function getFeeForSpecialty(specialty) {
  const key = (specialty || "General").trim();
  return PRICES_BY_SPECIALTY[key] ?? PRICES_BY_SPECIALTY.General;
}

module.exports = {
  getFeeForSpecialty,
  PRICES_BY_SPECIALTY,
};
