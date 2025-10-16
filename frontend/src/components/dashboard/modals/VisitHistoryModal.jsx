// src/components/dashboard/modals/VisitHistoryModal.jsx
import Modal from "../../common/Modal.jsx";

export default function VisitHistoryModal({ open, onClose, visits = [] }) {
  return (
    <Modal open={open} onClose={onClose} title="Visit History" width={720}>
      {visits.length === 0 ? (
        <div className="text-sm text-slate-600">No visit history</div>
      ) : (
        <ul className="space-y-3">
          {visits.map((v, i) => (
            <li key={i} className="rounded border p-3 bg-[#f9fbf8]">
              <div className="text-sm">
                <span className="font-semibold">Date:</span>{" "}
                {new Date(v.date).toLocaleDateString()}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Reason:</span> {v.reason}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Doctor:</span> {v.doctor}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Summary:</span> {v.summary}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
