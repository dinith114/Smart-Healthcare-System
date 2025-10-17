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
          {sorted.map((a, i) => {
            const doctorName =
              a.doctorInfo?.name || a.doctorId?.username || "Physician";
            const specialization = a.doctorInfo?.position || "";
            const appointmentDate = new Date(a.date);
            const timeStr = appointmentDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const dateStr = appointmentDate.toLocaleDateString();

            return (
              <li
                key={i}
                className="rounded-lg bg-white/70 p-3 border border-[#b9c8b4]"
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-sm text-[#2f3e2d]">
                    Dr. {doctorName}
                  </div>
                  <div className="text-xs text-[#5f6b6b] bg-[#e8f3e6] px-2 py-0.5 rounded">
                    {a.status || "Confirmed"}
                  </div>
                </div>
                {specialization && (
                  <div className="text-xs text-[#7e957a] mb-1">
                    {specialization}
                  </div>
                )}
                <div className="text-xs text-[#5f6b6b] flex items-center gap-3">
                  <span>📅 {dateStr}</span>
                  <span>🕐 {timeStr}</span>
                </div>
                {a.notes && (
                  <div className="text-xs text-[#5f6b6b] mt-1 italic">
                    {a.notes}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
