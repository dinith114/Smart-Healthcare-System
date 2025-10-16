// src/controllers/appointmentController.js
const Appointment = require("../models/appointmentModel");
const { isSlotAvailable } = require("../utils/slotUtils");
const { sendNotification } = require("../services/notificationService");

// 🟢 Create Appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, notes } = req.body;

    const slotFree = await isSlotAvailable(doctorId, date);
    if (!slotFree) {
      return res.status(400).json({ message: "Selected time no longer available" });
    }

    const appointment = await Appointment.create({ patientId, doctorId, date, notes });
    await sendNotification(patientId, "Appointment Confirmed", `Your appointment is confirmed for ${date}`);

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error("❌ Error creating appointment:", error);
    res.status(500).json({ message: "System error. Please try again later." });
  }
};

// 🟠 Reschedule Appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const slotFree = await isSlotAvailable(appointment.doctorId, newDate);
    if (!slotFree) {
      return res.status(400).json({ message: "Selected time no longer available" });
    }

    appointment.date = newDate;
    appointment.status = "Rescheduled";
    await appointment.save();

    await sendNotification(
      appointment.patientId,
      "Appointment Rescheduled",
      `Your appointment has been rescheduled to ${newDate}`
    );

    res.json({ message: "Appointment rescheduled successfully", appointment });
  } catch (error) {
    console.error("❌ Error rescheduling appointment:", error);
    res.status(500).json({ message: "System error. Please try again later." });
  }
};

// 🔴 Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "Cancelled";
    await appointment.save();

    await sendNotification(
      appointment.patientId,
      "Appointment Cancelled",
      "Your appointment has been cancelled successfully."
    );

    res.json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    console.error("❌ Error cancelling appointment:", error);
    res.status(500).json({ message: "System error. Please try again later." });
  }
};

// 🔍 View Appointments (for testing)
exports.getAppointments = async (_req, res) => {
  try {
    const appointments = await Appointment.find().populate("doctorId").populate("patientId");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};
