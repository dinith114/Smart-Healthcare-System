// src/components/dashboard/modals/MedicalInfoModal.jsx
import Modal from "../../common/Modal.jsx";

export default function MedicalInfoModal({ open, onClose, summary }) {
  const meds = summary?.medications || [];
  const labs = summary?.labs || [];
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Medical Information"
      width={720}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Medications</h4>
          {meds.length === 0 ? (
            <div className="text-sm text-slate-600">No records</div>
          ) : (
            <ul className="space-y-2">
              {meds.map((m, i) => (
                <li key={i} className="px-3 py-2 rounded bg-[#e7f0e2] text-sm">
                  {m}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h4 className="font-semibold mb-2">Lab Results</h4>
          {labs.length === 0 ? (
            <div className="text-sm text-slate-600">No records</div>
          ) : (
            <ul className="space-y-2">
              {labs.map((l, i) => (
                <li key={i} className="px-3 py-2 rounded bg-[#e7f0e2] text-sm">
                  {l}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
