import dayjs from "dayjs";
import { api } from "../api";

export const toISO = (dateStr, timeStr) =>
  dayjs(`${dateStr}T${timeStr}`).toISOString();

export async function createAppointment({ patientId, doctorId, isoDate, notes }) {
  const { data } = await api.post("/appointments/create-appointment", {
    patientId, doctorId, date: isoDate, notes
  });
  return data.appointment;
}

export async function listAppointments() {
  const { data } = await api.get("/appointments/get-appointment");
  return data;
}

export async function rescheduleAppointment(id, isoDate) {
  const { data } = await api.put(`/appointments/${id}/reschedule`, { newDate: isoDate });
  return data.appointment;
}

export async function cancelAppointment(id) {
  const { data } = await api.put(`/appointments/${id}/cancel`);
  return data.appointment;
}

export async function getAvailability(doctorId, ymd) {
  const { data } = await api.get("/appointments/availability", { params: { doctorId, date: ymd } });
  return data; // array of ISO strings
}
