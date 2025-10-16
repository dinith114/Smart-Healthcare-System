const express = require("express");
const { verifyCard } = require("../controllers/healthCardController");

const router = express.Router();

// Public endpoint for QR verification
router.post("/verify", verifyCard);

module.exports = router;

