// src/components/dashboard/modals/VitalStatusModal.jsx
import Modal from "../../common/Modal.jsx";

export default function VitalStatusModal({ open, onClose, vitals = {} }) {
  const v = {
    heartRate: "-",
    weightKg: "-",
    temperatureC: "-",
    oxygenSat: "-",
    ...vitals,
  };
  return (
    <Modal open={open} onClose={onClose} title="Vital Status">
      <dl className="grid grid-cols-2 gap-y-2 text-sm">
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
    </Modal>
  );
}
