import { useMemo, useState } from "react";

export default function Calendar({
  appointments = [],
  loading,
  className = "",
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11

  const firstDay = useMemo(() => new Date(year, month, 1), [year, month]);
  const daysInMonth = useMemo(
    () => new Date(year, month + 1, 0).getDate(),
    [year, month]
  );
  const startWeekday = firstDay.getDay(); // 0=Sun

  const matrix = useMemo(() => {
    const slots = [];
    for (let i = 0; i < startWeekday; i++) slots.push(null);
    for (let d = 1; d <= daysInMonth; d++) slots.push(new Date(year, month, d));
    return slots;
  }, [startWeekday, daysInMonth, year, month]);

  const monthName = new Intl.DateTimeFormat(undefined, {
    month: "long",
  }).format(firstDay);

  // mark days with appointments
  const apptSet = new Set(
    (appointments || []).map((a) => new Date(a.date).toISOString().slice(0, 10))
  );

  const prev = () => {
    const m = month - 1;
    if (m < 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth(m);
  };
  const next = () => {
    const m = month + 1;
    if (m > 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth(m);
  };

  return (
    <div className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#2f3e2d]">Doctor Appointment</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="px-2 py-1 rounded border border-[#b9c8b4]"
            >
              &lt;
            </button>
            <button
              onClick={next}
              className="px-2 py-1 rounded border border-[#b9c8b4]"
            >
              &gt;
            </button>
          </div>
        </div>
        <div className="text-sm text-slate-700 mb-2">
          {monthName} {year}
        </div>

        <div className="grid grid-cols-7 text-center text-sm text-slate-600">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {matrix.map((d, i) => (
            <div
              key={i}
              className="h-9 rounded-md bg-white/70 border border-[#d9e4d5] flex items-center justify-center text-sm"
            >
              {d && (
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    apptSet.has(d.toISOString().slice(0, 10))
                      ? "bg-[#6e8a69] text-white"
                      : ""
                  }`}
                >
                  {d.getDate()}
                </div>
              )}
            </div>
          ))}
        </div>
        {loading && (
          <div className="text-xs text-slate-500 mt-2">
            Loading appointments…
          </div>
        )}
      </div>
    </div>
  );
}
