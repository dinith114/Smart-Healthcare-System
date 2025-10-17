import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  listAppointments,
  rescheduleAppointment,
  cancelAppointment,
} from "../../services/appointment/appointments";

export default function AppointmentDetails() {
  const { id } = useParams();
  const loc = useLocation();
  const nav = useNavigate();
  const [appt, setAppt] = useState(loc.state?.appt || null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!appt) {
      listAppointments().then(list => {
        const found = list.find(a => a._id === id);
        if (found) setAppt(found);
      });
    }
  }, [id, appt]);

  if (!appt) return <div className="max-w-3xl mx-auto mt-8">Loading…</div>;

  const pretty = (d) => dayjs(d).format("DD/MM/YYYY");
  const prettyTime = (d) => dayjs(d).format("hh:mm A");
  const docName = appt?.doctorId?.username || "Doctor";

  const onReschedule = async () => {
    setErr("");
    if (!date || !time) { setErr("Pick a new date and time"); return; }
    try {
      const iso = dayjs(`${date}T${time}`).toISOString();
      const updated = await rescheduleAppointment(appt._id, iso);
      setAppt(updated);
      setDate(""); setTime("");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to reschedule");
    }
  };

  const onCancel = async () => {
    setErr("");
    try {
      const updated = await cancelAppointment(appt._id);
      setAppt(updated);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to cancel");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-center mb-6">Appointment Details</h1>

      {appt.status === "Confirmed" && (
        <div className="bg-green-100 border border-green-300 text-green-800 rounded p-3 mb-4">
          Appointment confirmed. You’ll receive a reminder 24 hours before.
        </div>
      )}

      <div className="bg-[var(--panel)] rounded-xl p-6 grid md:grid-cols-2 gap-4">
        <div><div className="font-semibold">Appointment Date</div>{pretty(appt.date)}</div>
        <div><div className="font-semibold">Appointment Time</div>{prettyTime(appt.date)}</div>
        <div><div className="font-semibold">Doctor</div>{docName}</div>
        <div><div className="font-semibold">Status</div>{appt.status}</div>
        <div className="md:col-span-2"><div className="font-semibold">Notes</div>{appt.notes || "-"}</div>

        <div className="md:col-span-2 flex gap-3 items-end mt-2">
          <div>
            <label className="block mb-1">New Date</label>
            <input type="date" className="p-2 border rounded" value={date} onChange={e=>setDate(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">New Time</label>
            <input type="time" className="p-2 border rounded" value={time} onChange={e=>setTime(e.target.value)} />
          </div>
          <button onClick={onReschedule} className="bg-white border rounded px-4 py-2">Reschedule</button>
          <button onClick={onCancel} className="bg-[var(--btn)] text-white rounded px-4 py-2">Cancel</button>
        </div>

        {err && <div className="md:col-span-2 text-red-700">{err}</div>}
      </div>
      <div className="text-center mt-4">
        <button className="underline" onClick={() => nav("/appointments")}>Back to list</button>
      </div>
    </div>
  );
}
