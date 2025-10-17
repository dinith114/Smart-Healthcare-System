const Appointment = require("../../models/appointment/appointmentModel");
const { isSlotAvailable, normalizeToSlot } = require("../../utils/appointment/slotUtils");
const { sendNotification, queueReminder24h } = require("../../services/appointment/notificationService");
const AuditLog = require("../../models/auditLogModel");

// Create
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, notes } = req.body;

    // basic validation
    if (!patientId || !doctorId || !date) {
      return res.status(400).json({ message: "patientId, doctorId, and date are required" });
    }

    const slot = normalizeToSlot(date);
    const ok = await isSlotAvailable(doctorId, patientId, slot.toISOString());
    if (!ok) {
      return res.status(409).json({ message: "Selected time no longer available." });
    }

    const appointment = await Appointment.create({
      patientId, doctorId, date: slot, notes, status: "Confirmed",
    });

    // Notifications & reminder
    await sendNotification(patientId, `Appointment confirmed on ${slot.toISOString()}`);
    await queueReminder24h(appointment._id, patientId, slot);

    // Audit
    await AuditLog.create({
      actorId: patientId,
      action: "AppointmentCreated",
      meta: { appointmentId: appointment._id, doctorId, date: slot },
    });

    res.status(201).json({ message: "Appointment created successfully", appointment });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "System error. Please try again later." });
  }
};

// Reschedule
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate } = req.body;
    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    const slot = normalizeToSlot(newDate);
    const ok = await isSlotAvailable(String(appt.doctorId), String(appt.patientId), slot.toISOString());
    if (!ok) {
      return res.status(409).json({ message: "Selected time no longer available." });
    }

    appt.date = slot;
    appt.status = "Rescheduled";
    await appt.save();

    await sendNotification(String(appt.patientId), `Appointment rescheduled to ${slot.toISOString()}`);
    await queueReminder24h(appt._id, String(appt.patientId), slot);

    await AuditLog.create({
      actorId: String(appt.patientId),
      action: "AppointmentRescheduled",
      meta: { appointmentId: appt._id, doctorId: String(appt.doctorId), date: slot },
    });

    res.json({ message: "Appointment rescheduled successfully", appointment: appt });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "System error. Please try again later." });
  }
};

// Cancel
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    appt.status = "Cancelled";
    await appt.save();

    await sendNotification(String(appt.patientId), `Appointment on ${appt.date.toISOString()} cancelled`);

    await AuditLog.create({
      actorId: String(appt.patientId),
      action: "AppointmentCancelled",
      meta: { appointmentId: appt._id, doctorId: String(appt.doctorId), date: appt.date },
    });

    res.json({ message: "Appointment cancelled successfully", appointment: appt });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "System error. Please try again later." });
  }
};

// List (patient sees own; doctor/staff can be extended by role)
exports.getAppointments = async (req, res) => {
  try {
    const user = req.user; // set by authenticate
    const q = user?.role === "doctor"
      ? { doctorId: user.id }
      : { patientId: user.id };

    const list = await Appointment.find(q)
      .populate("doctorId", "username specialty")
      .populate("patientId", "username");
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "System error. Please try again later." });
  }
};
