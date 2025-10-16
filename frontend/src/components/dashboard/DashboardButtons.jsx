export default function DashboardButtons({
  onMedical,
  onVitals,
  onVisits,
  onPayments,
}) {
  return (
    <div className="grid grid-cols-2 gap-6 mt-6">
      <button
        onClick={onMedical}
        className="rounded-lg bg-[#6e8a69] text-white py-3 hover:bg-[#5f7a5a]"
      >
        Medical Information
      </button>
      <button
        onClick={onVitals}
        className="rounded-lg bg-[#6e8a69] text-white py-3 hover:bg-[#5f7a5a]"
      >
        Vital Status
      </button>
      <button
        onClick={onVisits}
        className="rounded-lg bg-[#6e8a69] text-white py-3 hover:bg-[#5f7a5a]"
      >
        Visit History
      </button>
      <button
        onClick={onPayments}
        className="rounded-lg bg-[#6e8a69] text-white py-3 hover:bg-[#5f7a5a]"
      >
        Payment History
      </button>
    </div>
  );
}
