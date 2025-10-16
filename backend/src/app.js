// Insurance payment routes
const insurancePayRoutes = require("./routes/payment/insurancePayRoutes");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// route modules
const recordsRouter = require("./routes/records");
const auditRouter = require("./routes/audit");
const patientsRouter = require("./routes/patients"); // <-- ADD THIS
// const devRouter = require("./routes/dev"); // optional

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Payment routes
const paymentRoutes = require("./routes/payment/paymentRoutes");
app.use("/api/payment", paymentRoutes);
app.use("/api/insurance-payment", insurancePayRoutes);
// Feature routes
app.use("/api/records", recordsRouter);
app.use("/api/audit", auditRouter);
app.use("/api/patients", patientsRouter); // <-- AND THIS
// app.use("/api/dev", devRouter);

// 404 fallback
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});
const appointmentRoutes = require("./routes/appointment/appointmentRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);   


module.exports = app;
