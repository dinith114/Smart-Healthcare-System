const express = require("express");
const router = express.Router();
const { makeInsurancePayment } = require("../../controllers/payment/insurancePayController");

// POST /api/payment/insurance - Make an insurance payment
router.post("/", makeInsurancePayment);

module.exports = router;
