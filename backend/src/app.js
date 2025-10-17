// Insurance payment routes
const insurancePayRoutes = require("./routes/payment/insurancePayRoutes");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

// route modules
const authRouter = require("./routes/authRoutes");
const recordsRouter = require("./routes/records");
const auditRouter = require("./routes/audit");
const patientsRouter = require("./routes/patients"); // <-- ADD THIS
const detailedRecordsRouter = require("./routes/detailedRecords");
const avatarRouter = require("./routes/avatarRoutes");
// const devRouter = require("./routes/dev"); // optional

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

// Serve static files (avatars)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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
app.use("/api/auth", authRouter);

app.use("/api/records", recordsRouter);
app.use("/api/audit", auditRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/detailed-records", detailedRecordsRouter);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/health-card", healthCardRoutes);
app.use("/api/patients", avatarRouter);

// 404 fallback - MUST BE AFTER ALL ROUTES
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

module.exports = app;
