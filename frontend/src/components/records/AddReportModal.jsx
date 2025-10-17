import { useState } from "react";
import { api, getDemoHeaders } from "../../services/api";
import VitalsCard from "./VitalsCard";
import VisitHistoryCard from "./VisitHistoryCard";
import MedicationsCard from "./MedicationsCard";
import LabResultsCard from "./LabResultsCard";
import ImmunizationsCard from "./ImmunizationsCard";

export default function AddReportModal({ open, onClose, patientId, onSaved }) {
  const [vitals, setVitals] = useState({
    heartRate: "",
    weightKg: "",
    temperatureC: "",
    oxygenSat: "",
  });
  const [visits, setVisits] = useState([
    { date: "", reason: "", doctor: "", summary: "" },
  ]);
  const [medications, setMedications] = useState([]);
  const [labs, setLabs] = useState([]);
  const [immunizations, setImmunizations] = useState([
    { name: "", by: "", note: "" },
  ]);

  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    setErr("");
    setSaving(true);
    try {
      // Get demo headers for medical records endpoints
      const demoHeaders = getDemoHeaders();

      // Save the detailed medical record to database
      const detailedPayload = {
        note: "Complete medical report",
        vitals,
        visits,
        medications,
        labs,
        immunizations,
        providerName: "Provider",
        providerRole: "Provider",
      };

      await api.post(`/detailed-records/${patientId}`, detailedPayload, {
        headers: demoHeaders,
      });

      // Also update the patient summary
      const summaryPayload = {
        vitals,
        visits,
        medications,
        labs,
        immunizations,
      };

      await api.patch(`/patients/${patientId}/summary`, summaryPayload, {
        headers: demoHeaders,
      });

      // Create an encounter note for audit trail
      await api.post(
        `/records/${patientId}/encounters`,
        {
          note: "New medical report added",
          authorRole: "Provider",
        },
        { headers: demoHeaders }
      );

      setSaving(false);
      // Reset form
      setVitals({
        heartRate: "",
        weightKg: "",
        temperatureC: "",
        oxygenSat: "",
      });
      setVisits([{ date: "", reason: "", doctor: "", summary: "" }]);
      setMedications([]);
      setLabs([]);
      setImmunizations([{ name: "", by: "", note: "" }]);

      onSaved?.();
      onClose?.();
      alert("Report saved successfully");
    } catch (e) {
      setSaving(false);
      setErr(
        e.response?.data?.error ||
          e.response?.data?.message ||
          e.message ||
          "Failed to save report"
      );
    }
  };

  const handleCancel = () => {
    // Reset form
    setVitals({ heartRate: "", weightKg: "", temperatureC: "", oxygenSat: "" });
    setVisits([{ date: "", reason: "", doctor: "", summary: "" }]);
    setMedications([]);
    setLabs([]);
    setImmunizations([{ name: "", by: "", note: "" }]);
    setErr("");
    onClose?.();
  };

  return (
    <div style={backdrop}>
      <div style={modal}>
        <div style={header}>
          <h3 style={{ margin: 0 }}>Add Medical Report</h3>
          <button onClick={handleCancel} disabled={saving} style={closeBtn}>
            ✕
          </button>
        </div>

        <div style={scrollContent}>
          {err && <div style={errorBox}>{err}</div>}

          <div style={section}>
            <VitalsCard vitals={vitals} editable={true} onChange={setVitals} />
          </div>

          <div style={section}>
            <VisitHistoryCard
              items={visits}
              editable={true}
              onChange={setVisits}
            />
          </div>

          <div style={section}>
            <MedicationsCard
              items={medications}
              editable={true}
              onChange={setMedications}
            />
          </div>

          <div style={section}>
            <LabResultsCard items={labs} editable={true} onChange={setLabs} />
          </div>

          <div style={section}>
            <ImmunizationsCard
              items={immunizations}
              editable={true}
              onChange={setImmunizations}
            />
          </div>
        </div>

        <div style={footer}>
          <button onClick={handleCancel} disabled={saving} style={cancelBtn}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={saveBtn}>
            {saving ? "Saving..." : "Save Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modal = {
  background: "#fff",
  width: 900,
  maxWidth: "95%",
  maxHeight: "90vh",
  borderRadius: 12,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const header = {
  padding: "20px 24px",
  borderBottom: "1px solid #e5e5e5",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const closeBtn = {
  background: "none",
  border: "none",
  fontSize: "24px",
  cursor: "pointer",
  color: "#666",
  padding: "0 8px",
};

const scrollContent = {
  flex: 1,
  overflowY: "auto",
  padding: "24px",
};

const section = {
  marginBottom: "20px",
};

const footer = {
  padding: "16px 24px",
  borderTop: "1px solid #e5e5e5",
  display: "flex",
  gap: 12,
  justifyContent: "flex-end",
};

const cancelBtn = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #b9c8b4",
  background: "#fff",
  cursor: "pointer",
};

const saveBtn = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "none",
  background: "#6e8a69",
  color: "#fff",
  cursor: "pointer",
};

const errorBox = {
  background: "#fdecea",
  color: "#611a15",
  padding: "10px 14px",
  borderRadius: 6,
  marginBottom: 16,
};
