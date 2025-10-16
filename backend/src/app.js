const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const appointmentRoutes = require("./routes/appointment/appointmentRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);   


module.exports = app;
