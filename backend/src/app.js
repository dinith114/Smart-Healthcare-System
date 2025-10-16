// Insurance payment routes
const insurancePayRoutes = require("./routes/payment/insurancePayRoutes");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Payment routes
const paymentRoutes = require("./routes/payment/paymentRoutes");
app.use("/api/payment", paymentRoutes);
app.use("/api/insurance-payment", insurancePayRoutes);

module.exports = app;
