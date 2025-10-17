// Insurance payment routes
const insurancePayRoutes = require("./routes/payment/insurancePayRoutes");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

// route modules
const recordsRouter = require("./routes/records");
const auditRouter = require("./routes/audit");
const patientsRouter = require("./routes/patients"); // <-- ADD THIS
// const devRouter = require("./routes/dev"); // optional

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

// Import all route modules
const appointmentRoutes = require("./routes/appointment/appointmentRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const staffRoutes = require("./routes/staffRoutes");
const patientRoutes = require("./routes/patientRoutes");
const healthCardRoutes = require("./routes/healthCardRoutes");

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Payment routes
const paymentRoutes = require("./routes/payment/paymentRoutes");
app.use("/api/payment", paymentRoutes);
app.use("/api/insurance-payment", insurancePayRoutes);
// Feature routes
app.use("/api/records", recordsRouter);
app.use("/api/audit", auditRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/health-card", healthCardRoutes);

// 404 fallback - MUST BE AFTER ALL ROUTES
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const appointmentRoutes = require("./routes/appointment/appointmentRoutes");
const availabilityRoutes = require("./routes/appointment/availabilityRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);   
app.use("/api/appointments/availability", availabilityRoutes);
app.use("/api/users", userRoutes);

module.exports = app;
