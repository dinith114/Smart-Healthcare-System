import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  listAppointments,
  rescheduleAppointment,
  cancelAppointment,
} from "../../services/appointment/appointments";
import { motion } from "framer-motion";

export default function AppointmentDetails() {
  const { id } = useParams();
  const loc = useLocation();
  const nav = useNavigate();
  const [appt, setAppt] = useState(loc.state?.appt || null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!appt) {
      listAppointments().then((list) => {
        const found = list.find((a) => a._id === id);
        if (found) setAppt(found);
      });
    }
  }, [id, appt]);

  if (!appt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#8aa082] to-[#7e957a] flex items-center justify-center p-4">
        <div className="text-white/90 text-lg">Loading…</div>
      </div>
    );
  }

  const pretty = (d) => dayjs(d).format("DD/MM/YYYY");
  const prettyTime = (d) => dayjs(d).format("hh:mm A");
  const docName = appt?.doctorId?.username || "Doctor";

  const onReschedule = async () => {
    setErr("");
    if (!date || !time) {
      setErr("Pick a new date and time");
      return;
    }
    try {
      setLoading(true);
      const iso = dayjs(`${date}T${time}`).toISOString();
      const updated = await rescheduleAppointment(appt._id, iso);
      setAppt(updated);
      setDate("");
      setTime("");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to reschedule");
    } finally {
      setLoading(false);
    }
  };

  const onCancel = async () => {
    setErr("");
    try {
      setLoading(true);
      const updated = await cancelAppointment(appt._id);
      setAppt(updated);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to cancel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8aa082] to-[#7e957a] p-4 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-3"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-white">Appointment Details</h1>
          <p className="text-white/80 mt-1">Review, reschedule, or cancel</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {appt.status === "Confirmed" && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 mb-4 text-sm">
              Appointment confirmed. You’ll receive a reminder 24 hours before.
            </div>
          )}

          {err && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {err}
            </div>
          )}

          {/* Details grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold text-[#2d3b2b]">Appointment Date</div>
              <div className="text-[#2d3b2b]">{pretty(appt.date)}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#2d3b2b]">Appointment Time</div>
              <div className="text-[#2d3b2b]">{prettyTime(appt.date)}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#2d3b2b]">Doctor</div>
              <div className="text-[#2d3b2b]">{docName}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#2d3b2b]">Status</div>
              <div className="text-[#2d3b2b]">{appt.status}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm font-semibold text-[#2d3b2b]">Notes</div>
              <div className="text-[#2d3b2b]">{appt.notes || "-"}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 grid md:grid-cols-[1fr_auto_auto] gap-3 items-end">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#2d3b2b] mb-2">New Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a] focus:border-transparent"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d3b2b] mb-2">New Time</label>
                <input
                  type="time"
                  className="w-full px-4 py-3 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a] focus:border-transparent"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              onClick={onReschedule}
              disabled={loading}
              className="bg-white border border-[#b9c8b4] hover:border-[#7e957a] text-[#2d3b2b] px-5 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait…" : "Reschedule"}
            </button>

            <button
              onClick={onCancel}
              disabled={loading}
              className="bg-[#7e957a] hover:bg-[#6e8a69] text-white px-5 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Cancelling…" : "Cancel"}
            </button>
          </div>

          {/* Back link */}
          <div className="text-center mt-6">
            <button className="underline text-[#7e957a]" onClick={() => nav("/appointments")}>
              Back to list
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
