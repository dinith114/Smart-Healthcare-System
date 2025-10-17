import { useEffect, useMemo, useState } from "react";
import { listAppointments } from "../../services/appointment/appointments";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

export default function AppointmentsPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("date");
  const nav = useNavigate();

  useEffect(() => { listAppointments().then(setItems); }, []);
  const filtered = useMemo(() => {
    const f = items.filter(a => {
      const name = a?.doctorId?.username || "";
      return name.toLowerCase().includes(q.toLowerCase());
    });
    return f.sort((a,b) => sort==="date"
      ? new Date(a.date) - new Date(b.date)
      : (a?.doctorId?.username||"").localeCompare(b?.doctorId?.username||""));
  }, [items, q, sort]);

  const pretty = (d) => dayjs(d).format("DD/MM/YYYY");
  const prettyTime = (d) => dayjs(d).format("hh:mm A");

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <div className="flex gap-2">
          <input className="border rounded px-2" placeholder="search doctor…" value={q} onChange={e=>setQ(e.target.value)} />
          <select className="border rounded px-2" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="date">sort by date</option>
            <option value="doctor">sort by doctor</option>
          </select>
          <button className="bg-[var(--btn)] text-white px-3 rounded" onClick={()=>nav("/appointments/new")}>Make Appointment</button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(a => (
          <div key={a._id}
               className="bg-[var(--panel)] rounded-full px-4 py-3 flex justify-between items-center cursor-pointer"
               onClick={()=>nav(`/appointments/${a._id}`, { state: { appt: a } })}>
            <div className="font-medium">{a?.doctorId?.username || "Doctor"}</div>
            <div>{pretty(a.date)}</div>
            <div>{prettyTime(a.date)}</div>
          </div>
        ))}
        {filtered.length===0 && <div className="text-center opacity-70">No appointments</div>}
      </div>
    </div>
  );
}
