export default function ImmunizationsCard({
  items = [],
  editable = false,
  onChange,
}) {
  const i = items[0] || { name: "", by: "", note: "" };
  const set = (k, val) => onChange?.([{ ...i, [k]: val }]);

  return (
    <div className="rounded-2xl border border-[#b9c8b4] bg-[#f0f5ef] p-4">
      <h3 className="font-semibold text-[#2f3e2d] mb-2">
        Immunization Records{" "}
        {editable && <span className="ml-2 text-slate-500">✎</span>}
      </h3>
      {!editable ? (
        !items[0] ? (
          <div className="text-sm text-slate-600">No data</div>
        ) : (
          <div className="text-sm space-y-1">
            <div>
              <span className="font-semibold">Vaccine:</span> {i.name}
            </div>
            <div>
              <span className="font-semibold">Administered by:</span> {i.by}
            </div>
            <div>
              <span className="font-semibold">Notes:</span> {i.note}
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 gap-2">
          <Input
            label="Vaccine"
            value={i.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <Input
            label="Administered by"
            value={i.by}
            onChange={(e) => set("by", e.target.value)}
          />
          <label className="text-sm">
            <span className="block mb-1 font-medium">Notes</span>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-[#b9c8b4] bg-white px-2 py-1"
              value={i.note}
              onChange={(e) => set("note", e.target.value)}
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
