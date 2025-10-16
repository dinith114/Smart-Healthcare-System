export default function VitalsCard({
  vitals = {},
  editable = false,
  onChange,
}) {
  const v = {
    heartRate: "",
    weightKg: "",
    temperatureC: "",
    oxygenSat: "",
    ...vitals,
  };

  const set = (k, val) =>
    onChange?.({ ...v, [k]: val === "" ? "" : Number(val) });

  return (
    <div className="rounded-2xl border border-[#b9c8b4] bg-[#f0f5ef] p-4 relative">
      <h3 className="font-semibold text-[#2f3e2d] mb-2">
        Vital Status{" "}
        {editable && <span className="ml-2 text-slate-500">✎</span>}
      </h3>
      {!editable ? (
        <dl className="grid grid-cols-2 gap-y-1 text-sm">
          <div>
            <dt className="font-semibold inline">Heart Rate:</dt>{" "}
            <dd className="inline">{v.heartRate} bpm</dd>
          </div>
          <div>
            <dt className="font-semibold inline">Weight:</dt>{" "}
            <dd className="inline">{v.weightKg} kg</dd>
          </div>
          <div>
            <dt className="font-semibold inline">Temperature:</dt>{" "}
            <dd className="inline">{v.temperatureC}°C</dd>
          </div>
          <div>
            <dt className="font-semibold inline">O₂ Saturation:</dt>{" "}
            <dd className="inline">{v.oxygenSat}%</dd>
          </div>
        </dl>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Heart Rate (bpm)"
            value={v.heartRate}
            onChange={(e) => set("heartRate", e.target.value)}
          />
          <Input
            label="Weight (kg)"
            value={v.weightKg}
            onChange={(e) => set("weightKg", e.target.value)}
          />
          <Input
            label="Temperature (°C)"
            value={v.temperatureC}
            onChange={(e) => set("temperatureC", e.target.value)}
          />
          <Input
            label="O₂ Saturation (%)"
            value={v.oxygenSat}
            onChange={(e) => set("oxygenSat", e.target.value)}
          />
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
