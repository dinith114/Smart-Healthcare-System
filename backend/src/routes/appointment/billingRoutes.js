// backend/src/routes/appointment/billingRoutes.js

const express = require("express");
const router = express.Router();
const { getQuote } = require("../../controllers/appointment/billingController");
// If you require auth to view quotes, import your auth middleware and use it here
// const { authenticate } = require("../middleware/auth");
// router.get("/quote", authenticate, getQuote);
router.get("/quote", getQuote);

module.exports = router;
