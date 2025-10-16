// src/components/dashboard/modals/PaymentHistoryModal.jsx
import { useEffect, useState } from "react";
import Modal from "../../common/Modal.jsx";
import { api } from "../../../services/api";

export default function PaymentHistoryModal({ open, onClose, patientId }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (!open) return;
    api
      .get(`/payments?patientId=${patientId}`)
      .then((r) => setItems(r.data || []))
      .catch(() => setItems([]));
  }, [open, patientId]);

  return (
    <Modal open={open} onClose={onClose} title="Payment History" width={720}>
      {items.length === 0 ? (
        <div className="text-sm text-slate-600">No payments recorded.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Date</th>
              <th className="py-2">Method</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{new Date(p.date).toLocaleString()}</td>
                <td className="py-2">{p.method || "-"}</td>
                <td className="py-2">{p.amount ? `Rs. ${p.amount}` : "-"}</td>
                <td className="py-2">{p.status || "Paid"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}
