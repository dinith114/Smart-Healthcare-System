// src/routes/appointmentRoutes.js
const express = require("express");

const {
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  getAppointments,
} = require("../../controllers/appointment/appointmentController");

const router = express.Router();

// Base URL: /api/appointments
router.post("/create-appointment", createAppointment);
router.put("/:id/reschedule", rescheduleAppointment);
router.put("/:id/cancel", cancelAppointment);
router.get("/get-appointment", getAppointments);

module.exports = router;
