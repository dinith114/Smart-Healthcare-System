export default function VisitHistoryCard({
  items = [],
  editable = false,
  onChange,
}) {
  const v = items[0] || { date: "", reason: "", doctor: "", summary: "" };
  const set = (k, val) => onChange?.([{ ...v, [k]: val }]);

  return (
    <div className="rounded-2xl border border-[#b9c8b4] bg-[#f0f5ef] p-4">
      <h3 className="font-semibold text-[#2f3e2d] mb-2">
        Visit History{" "}
        {editable && <span className="ml-2 text-slate-500">✎</span>}
      </h3>
      {!editable ? (
        !items[0] ? (
          <div className="text-sm text-slate-600">No data</div>
        ) : (
          <div className="text-sm space-y-1">
            <div>
              <span className="font-semibold">Date:</span>{" "}
              {new Date(v.date).toLocaleDateString()}
            </div>
            <div>
              <span className="font-semibold">Reason:</span> {v.reason}
            </div>
            <div>
              <span className="font-semibold">Doctor:</span> {v.doctor}
            </div>
            <div>
              <span className="font-semibold">Summary:</span> {v.summary}
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 gap-2 text-sm">
          <label className="text-sm">
            <span className="block mb-1 font-medium">Date</span>
            <input
              type="date"
              className="w-full rounded-lg border border-[#b9c8b4] bg-white px-2 py-1"
              value={v.date ? new Date(v.date).toISOString().slice(0, 10) : ""}
              onChange={(e) => set("date", e.target.value)}
            />
          </label>
          <Input
            label="Reason"
            value={v.reason}
            onChange={(e) => set("reason", e.target.value)}
          />
          <Input
            label="Doctor"
            value={v.doctor}
            onChange={(e) => set("doctor", e.target.value)}
          />
          <label className="text-sm">
            <span className="block mb-1 font-medium">Summary</span>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-[#b9c8b4] bg-white px-2 py-1"
              value={v.summary}
              onChange={(e) => set("summary", e.target.value)}
            />
          </label>
        </div>
      )}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="text-sm">
      <span className="block mb-1 font-medium">{label}</span>
      <input
        className="w-full rounded-lg border border-[#b9c8b4] bg-white px-2 py-1"
        {...props}
      />
    </label>
  );
}
