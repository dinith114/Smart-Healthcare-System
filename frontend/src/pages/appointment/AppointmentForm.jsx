import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { currentUser } from "../../services/auth";
import {
  createAppointment,
  getAvailability,
} from "../../services/appointment/appointments";
import { listDoctors } from "../../services/users";

export default function AppointmentForm() {
  const nav = useNavigate();
  const user = currentUser();
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("");
  const [err, setErr] = useState("");
  const [slots, setSlots] = useState([]); // ISO strings
  const [selectedIso, setSelectedIso] = useState("");

  useEffect(() => {
    // fetch doctors on mount
    listDoctors().then((d) => {
      setDoctors(d);
      if (d?.length) setDoctorId(d[0]._id);
    }).catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    // fetch availability when doctor & date selected
    setSlots([]); setSelectedIso("");
    if (doctorId && date) {
      getAvailability(doctorId, date).then(setSlots).catch(() => setSlots([]));
    }
  }, [doctorId, date]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!user) { setErr("Please login first."); return; }
    if (!selectedIso) { setErr("Please pick a time slot."); return; }

    try {
      const appt = await createAppointment({
        patientId: user.userId,
        doctorId,
        isoDate: selectedIso,
        notes: [type, notes].filter(Boolean).join(" — "),
      });
      nav(`/appointments/${appt._id}`, { state: { appt } });
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to book");
    }
  };

  const pretty = (iso) => dayjs(iso).format("hh:mm A");

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-center mb-6">Make Appointment</h1>

      <form onSubmit={onSubmit} className="bg-[var(--panel)] rounded-xl p-6 grid gap-4">
        <div>
          <label className="block mb-1">Doctor</label>
          <select className="w-full p-2 rounded border"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}>
            {doctors.map(d => (
              <option key={d._id} value={d._id}>
                {d.username}{d.specialty ? ` — ${d.specialty}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Date</label>
          <input type="date" className="w-full p-2 rounded border"
                 value={date}
                 onChange={(e) => setDate(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Available time slots</label>
          <div className="flex flex-wrap gap-2">
            {slots.map((iso) => (
              <button type="button"
                      key={iso}
                      onClick={() => setSelectedIso(iso)}
                      className={`px-3 py-1 rounded border ${selectedIso === iso ? "bg-[var(--btn)] text-white" : "bg-white"}`}>
                {pretty(iso)}
              </button>
            ))}
            {!doctorId || !date ? <div className="opacity-60">Pick a doctor and date</div> : null}
            {doctorId && date && slots.length === 0 ? <div className="opacity-60">No free slots</div> : null}
          </div>
        </div>

        <div>
          <label className="block mb-1">Type of visit</label>
          <input className="w-full p-2 rounded border"
                 placeholder="e.g., Depression"
                 value={type}
                 onChange={(e) => setType(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Additional notes</label>
          <textarea className="w-full p-2 rounded border"
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)} />
        </div>

        {err && <div className="text-red-700">{err}</div>}

        <div>
          <button className="bg-[var(--btn)] text-white px-4 py-2 rounded">Confirm Appointment</button>
        </div>
      </form>
    </div>
  );
}
