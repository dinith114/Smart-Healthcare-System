import { useEffect, useMemo, useState } from "react";
import { listAppointments } from "../../services/appointment/appointments";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import PatientNavBar from "../../components/patient/PatientNavBar";
import Footer from "../../components/patient/Footer";

export default function AppointmentsPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("date");
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    listAppointments()
      .then(setItems)
      .finally(() => setLoading(false));
  }, [location.pathname]);

  const filtered = useMemo(() => {
    const f = items.filter((a) => {
      const name = a?.doctorId?.username || "";
      return name.toLowerCase().includes(q.toLowerCase());
    });
    return f.sort((a, b) =>
      sort === "date"
        ? new Date(a.date) - new Date(b.date)
        : (a?.doctorId?.username || "").localeCompare(
            b?.doctorId?.username || ""
          )
    );
  }, [items, q, sort]);

  const pretty = (d) => dayjs(d).format("DD/MM/YYYY");
  const prettyTime = (d) => dayjs(d).format("hh:mm A");

  return (
    <div className="min-h-screen bg-[#8aa082]/30 flex flex-col">
      <PatientNavBar />
      
      <main className="flex-grow max-w-6xl mx-auto px-6 py-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Top bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-[#2d3b2b]">My Appointments</h1>
          <div className="flex items-center gap-3">
            <input
              className="px-4 py-2 rounded-lg border border-[#b9c8b4] bg-white focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
              placeholder="search doctor…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="px-3 py-2 rounded-lg border border-[#b9c8b4] bg-white focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="date">sort by date</option>
              <option value="doctor">sort by doctor</option>
            </select>
            <button
              className="bg-[#7e957a] text-white px-4 py-2 rounded-lg hover:bg-[#6e8a69] transition-colors flex items-center gap-2"
              onClick={() => nav("/appointments/new")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Book Appointment
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#b9c8b4] shadow-lg p-6">
          {filtered.length === 0 ? (
            <div className="text-gray-600 text-center">
              No appointments
              <button
                onClick={() => nav("/appointments/new")}
                className="ml-2 underline text-[#7e957a]"
              >
                Make one now
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((a) => (
                <li
                  key={a._id}
                  className="bg-[#f7faf7] border border-[#e3eee2] rounded-xl px-4 py-3 flex items-center justify-between hover:border-[#7e957a] transition cursor-pointer"
                  onClick={() =>
                    nav(`/appointments/${a._id}`, { state: { appt: a } })
                  }
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <div className="font-semibold text-[#2d3b2b]">
                      {a?.doctorId?.username || "Doctor"}
                    </div>
                    <div className="text-sm text-[#2d3b2b]">
                      {pretty(a.date)}
                    </div>
                    <div className="text-sm text-[#2d3b2b]">
                      {prettyTime(a.date)}
                    </div>
                    <div className="text-xs px-2 py-1 rounded bg-white border border-[#e3eee2] text-[#2d3b2b]">
                      {a.status}
                    </div>
                  </div>
                  <span className="text-[#7e957a] text-sm underline">View</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
