// src/utils/slotUtils.js
const Appointment = require("../../models/appointment/appointmentModel");

// Check if doctor has an existing appointment at this time
exports.isSlotAvailable = async (doctorId, date) => {
  const conflict = await Appointment.findOne({
    doctorId,
    date: new Date(date),
    status: { $ne: "Cancelled" },
  });
  return !conflict;
};
