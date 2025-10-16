exports.validateCard = (card) => {
  const { cardNumber, cardOwner, cvc, expiryMM, expiryYY } = card;

  // Validate card number (13-19 digits)
  if (!cardNumber || !/^\d{13,19}$/.test(cardNumber)) {
    console.log("Card validation failed: Invalid card number");
    return false;
  }

  // Validate CVC (3-4 digits)
  if (!cvc || !/^\d{3,4}$/.test(cvc)) {
    console.log("Card validation failed: Invalid CVC");
    return false;
  }

  // Validate card owner
  if (!cardOwner || !cardOwner.trim()) {
    console.log("Card validation failed: Card owner missing");
    return false;
  }

  // Validate expiry date
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  const expYear = parseInt(expiryYY);
  const expMonth = parseInt(expiryMM);

  if (isNaN(expYear) || isNaN(expMonth)) {
    console.log("Card validation failed: Invalid expiry date format");
    return false;
  }

  if (expYear < currentYear || (expYear == currentYear && expMonth < currentMonth)) {
    console.log("Card validation failed: Card expired");
    return false;
  }

  console.log("Card validation passed");
  return true;
};
