// src/controllers/appointmentController.js
const Appointment = require("../../models/appointment/appointmentModel");
const { isSlotAvailable } = require("../../utils/appointment/slotUtils");
const {
  sendNotification,
} = require("../../services/appointment/notificationService");

// 🟢 Create Appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, notes } = req.body;

    const slotFree = await isSlotAvailable(doctorId, date);
    if (!slotFree) {
      return res
        .status(400)
        .json({ message: "Selected time no longer available" });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      notes,
    });
    await sendNotification(
      patientId,
      "Appointment Confirmed",
      `Your appointment is confirmed for ${date}`
    );

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
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    const slotFree = await isSlotAvailable(appointment.doctorId, newDate);
    if (!slotFree) {
      return res
        .status(400)
        .json({ message: "Selected time no longer available" });
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
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

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
exports.getAppointments = async (req, res) => {
  try {
    const { patientId } = req.query;
    const Staff = require("../../models/Staff");

    // Filter by patientId if provided, otherwise return all
    const filter = patientId ? { patientId } : {};

    const appointments = await Appointment.find(filter)
      .populate("doctorId")
      .populate("patientId")
      .sort({ date: 1 }); // Sort by date ascending (upcoming first)

    // Enrich with staff details (position/specialization)
    const enrichedAppointments = await Promise.all(
      appointments.map(async (apt) => {
        const aptObj = apt.toObject();
        if (aptObj.doctorId && aptObj.doctorId._id) {
          const staffInfo = await Staff.findOne({
            userId: aptObj.doctorId._id,
          });
          if (staffInfo) {
            aptObj.doctorInfo = {
              name: staffInfo.fullName,
              position: staffInfo.position,
              username: aptObj.doctorId.username,
            };
          }
        }
        return aptObj;
      })
    );

    res.json(enrichedAppointments);
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};
