// src/components/records/LabResultsCard.jsx
import { toDateInputValue, formatDisplayDate } from "../../utils/date";

export default function LabResultsCard({
  items = [],
  editable = false,
  onChange,
}) {
  const add = () => onChange?.([...(items || []), ""]);
  const set = (i, val) => {
    const next = [...items];
    next[i] = val;
    onChange?.(next);
  };
  const remove = (i) => onChange?.(items.filter((_, idx) => idx !== i));

  return (
    <div className="rounded-2xl border border-[#b9c8b4] bg-[#f0f5ef] p-4">
      <h3 className="font-semibold text-[#2f3e2d] mb-2">
        Lab Results {editable && <span className="ml-2 text-slate-500">✎</span>}
      </h3>

      {!editable ? (
        items.length === 0 ? (
          <div className="text-sm text-slate-600">No data</div>
        ) : (
          <ul className="space-y-2">
            {items.map((d, i) => (
              <li key={i} className="px-3 py-2 rounded-lg bg-[#dfead9] text-sm">
                {formatDisplayDate(d)}
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="space-y-2">
          {items.map((d, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="date"
                className="flex-1 rounded-lg border border-[#b9c8b4] bg-white px-2 py-1"
                value={toDateInputValue(d)}
                onChange={(e) => set(i, e.target.value)}
              />
              <button
                onClick={() => remove(i)}
                className="px-2 rounded border border-[#b9c8b4]"
              >
                –
              </button>
            </div>
          ))}
          <button
            onClick={add}
            className="px-2 py-1 rounded border border-[#b9c8b4] bg-white"
          >
            + Add
          </button>
        </div>
      )}
    </div>
  );
}
