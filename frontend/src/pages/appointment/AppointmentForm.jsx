import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { currentUser } from "../../services/auth";
import {
  createAppointment,
  getAvailability,
} from "../../services/appointment/appointments";
import { listDoctors } from "../../services/users";
import { motion } from "framer-motion";

export default function AppointmentForm() {
  const nav = useNavigate();
  const user = currentUser();
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");          // keep empty so placeholder shows
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("");
  const [err, setErr] = useState("");
  const [slots, setSlots] = useState([]); // ISO strings
  const [selectedIso, setSelectedIso] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listDoctors()
      .then((d) => {
        setDoctors(d || []);
        // ❌ don't preselect a doctor; keep placeholder visible
      })
      .catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    setSlots([]);
    setSelectedIso("");
    if (doctorId && date) {
      getAvailability(doctorId, date)
        .then(setSlots)
        .catch(() => setSlots([]));
    }
  }, [doctorId, date]);

  const onSubmit = (e) => {
  e.preventDefault();
  setErr("");

  if (!user) return setErr("Please login first.");
  if (!doctorId) return setErr("Please select a doctor.");
  if (!selectedIso) return setErr("Please pick a time slot.");

  const doctor = doctors.find((d) => d._id === doctorId) || null;

  // build the draft payload expected by ConfirmAppointment.jsx
  const draft = {
    patientId: user.userId,
    doctorId,
    doctor,                // so you can show name/specialty there
    isoDate: selectedIso,  // exact slot
    type,
    notes: [type, notes].filter(Boolean).join(" — "),
  };

  nav("/appointments/confirm", { state: { draft } });
};

  const pretty = (iso) => dayjs(iso).format("hh:mm A");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8aa082] to-[#7e957a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-3"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-white">Make Appointment</h1>
          <p className="text-white/80 mt-1">Choose a doctor, pick a date, and select a time slot</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl p-6 md:p-8"
        >
          <form onSubmit={onSubmit} className="grid gap-6">
            {err && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {err}
              </motion.div>
            )}

            {/* Doctor */}
            <div>
              <label className="block text-sm font-medium text-[#2d3b2b] mb-2">Doctor</label>
              <select
                className={`w-full px-4 py-3 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a] focus:border-transparent ${
                doctorId ? "text-[#2d3b2b]" : "text-gray-400"
                }`}
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                disabled={loading}
                required
              >
                <option value="" disabled>— Select doctor —</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.username}
                    {d.position ? ` — ${d.position}` : ""}
                    {d.specialty ? ` (${d.specialty})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-[#2d3b2b] mb-2">Date</label>
              <input
                type="date"
                placeholder="Select date" // harmless; some browsers ignore for date
                className={`w-full px-4 py-3 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a] focus:border-transparent ${
                  date ? "text-[#2d3b2b]" : "text-gray-400"
                }`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
                required
              />

            </div>

            {/* Slots */}
            <div>
              <label className="block text-sm font-medium text-[#2d3b2b] mb-2">Available time slots</label>
              <div className="flex flex-wrap gap-2">
                {slots.map((iso) => {
                  const active = selectedIso === iso;
                  return (
                    <button
                      type="button"
                      key={iso}
                      onClick={() => setSelectedIso(iso)}
                      disabled={loading}
                      className={`px-3 py-2 rounded-lg border text-sm transition
                        ${active
                          ? "bg-[#7e957a] border-[#7e957a] text-white"
                          : "bg-white border-[#b9c8b4] text-[#2d3b2b] hover:border-[#7e957a]"}`}
                    >
                      {pretty(iso)}
                    </button>
                  );
                })}
                {!doctorId || !date ? (
                  <div className="opacity-70 text-sm">Pick a doctor and date</div>
                ) : null}
                {doctorId && date && slots.length === 0 ? (
                  <div className="opacity-70 text-sm">No free slots</div>
                ) : null}
              </div>
            </div>

            {/* Type of visit */}
            <div>
              <label className="block text-sm font-medium text-[#2d3b2b] mb-2">Type of visit</label>
              <input
                className="w-full px-4 py-3 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a] focus:border-transparent"
                placeholder="e.g., Depression"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[#2d3b2b] mb-2">Additional notes</label>
              <textarea
                className="w-full px-4 py-3 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a] focus:border-transparent"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-[#7e957a] text-white py-3 rounded-lg font-semibold hover:bg-[#6e8a69] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Booking…
                </span>
              ) : (
                "Make Appointment"
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer helper */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="text-center text-white/80 text-sm mt-6"
        >
          <p>You’ll receive a confirmation and a reminder 24 hours before.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
