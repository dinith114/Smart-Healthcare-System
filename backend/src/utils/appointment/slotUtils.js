const Appointment = require("../../models/appointment/appointmentModel");

// Normalize any ISO date to the slot-start (30 min grid)
function normalizeToSlot(dateISO) {
  const d = new Date(dateISO);
  d.setSeconds(0, 0);
  const mins = d.getMinutes();
  d.setMinutes(mins - (mins % 30));
  return d;
}

// Return true if BOTH doctor & patient are free for the slot
exports.isSlotAvailable = async (doctorId, patientId, dateISO) => {
  const slot = normalizeToSlot(dateISO);

  const [doctorClash, patientClash] = await Promise.all([
    Appointment.findOne({
      doctorId,
      date: slot,
      status: { $ne: "Cancelled" },
    }),
    Appointment.findOne({
      patientId,
      date: slot,
      status: { $ne: "Cancelled" },
    }),
  ]);

  return !(doctorClash || patientClash);
};

exports.normalizeToSlot = normalizeToSlot;
