import EmptyState from "../common/EmptyState.jsx";

export default function UpcomingAppointments({
  appointments = [],
  loading,
  className = "",
}) {
  const sorted = [...appointments]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);
  return (
    <div className={className}>
      <h3 className="font-semibold text-[#2f3e2d] mb-2">Upcoming</h3>
      {loading ? (
        <div className="text-sm text-slate-600">Loading…</div>
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No upcoming appointments"
          subtitle="Booked visits will appear here."
        />
      ) : (
        <ul className="space-y-2">
          {sorted.map((a, i) => (
            <li key={i} className="rounded-lg bg-white/70 p-2">
              <div className="font-medium text-sm">
                {new Date(a.date).toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">
                {a.doctorName || "Physician"} — {a.notes || "Follow-up"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
