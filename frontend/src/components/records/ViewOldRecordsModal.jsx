import { useEffect, useState } from "react";
import { api, getDemoHeaders } from "../../services/api";
import LoadingSkeleton from "../common/LoadingSkeleton";
import ErrorBanner from "../common/ErrorBanner";
import EmptyState from "../common/EmptyState";
import { formatDateTime, formatDisplayDate } from "../../utils/date";

export default function ViewOldRecordsModal({ open, onClose, patientId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (!open) return;
    loadOldRecords();
  }, [open, patientId]);

  const loadOldRecords = async () => {
    setLoading(true);
    setErr("");
    try {
      const demoHeaders = getDemoHeaders();
      // Fetch detailed medical records from database
      const res = await api.get(`/detailed-records/${patientId}`, {
        headers: demoHeaders,
      });
      setRecords(res.data?.records || []);
      setLoading(false);
    } catch (e) {
      setErr(
        e.response?.data?.error ||
          e.response?.data?.message ||
          e.message ||
          "Failed to load old records"
      );
      setLoading(false);
    }
  };

  const handleRecordClick = (record) => {
    setSelectedRecord(record);
  };

  const handleCloseDetail = () => {
    setSelectedRecord(null);
  };

  if (!open) return null;

  // Show detail view if a record is selected
  if (selectedRecord) {
    return (
      <div style={backdrop}>
        <div style={modal}>
          <div style={header}>
            <h3 style={{ margin: 0 }}>Record Details</h3>
            <button onClick={handleCloseDetail} style={backBtn}>
              ← Back
            </button>
          </div>

          <div style={scrollContent}>
            <div style={detailViewContainer}>
              <div style={detailHeader}>
                <div>
                  <h4 style={{ margin: "0 0 8px 0" }}>
                    {selectedRecord.providerName || selectedRecord.providerRole}
                  </h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#5f6b6b" }}>
                    {formatDateTime(selectedRecord.createdAt)}
                  </p>
                </div>
              </div>

              <div style={detailSection}>
                <h5 style={sectionTitle}>Note</h5>
                <p style={sectionContent}>{selectedRecord.note}</p>
              </div>

              {selectedRecord.vitals &&
                Object.keys(selectedRecord.vitals).some(
                  (k) => selectedRecord.vitals[k]
                ) && (
                  <div style={detailSection}>
                    <h5 style={sectionTitle}>Vital Status</h5>
                    <div style={detailsGrid}>
                      {selectedRecord.vitals.heartRate && (
                        <div>
                          <strong>Heart Rate:</strong>{" "}
                          {selectedRecord.vitals.heartRate} bpm
                        </div>
                      )}
                      {selectedRecord.vitals.weightKg && (
                        <div>
                          <strong>Weight:</strong>{" "}
                          {selectedRecord.vitals.weightKg} kg
                        </div>
                      )}
                      {selectedRecord.vitals.temperatureC && (
                        <div>
                          <strong>Temperature:</strong>{" "}
                          {selectedRecord.vitals.temperatureC}°C
                        </div>
                      )}
                      {selectedRecord.vitals.oxygenSat && (
                        <div>
                          <strong>O₂ Saturation:</strong>{" "}
                          {selectedRecord.vitals.oxygenSat}%
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {selectedRecord.medications &&
                selectedRecord.medications.length > 0 && (
                  <div style={detailSection}>
                    <h5 style={sectionTitle}>Medications</h5>
                    <ul style={detailsList}>
                      {selectedRecord.medications.map((med, idx) => (
                        <li key={idx}>{formatDisplayDate(med)}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {selectedRecord.labs && selectedRecord.labs.length > 0 && (
                <div style={detailSection}>
                  <h5 style={sectionTitle}>Lab Results</h5>
                  <ul style={detailsList}>
                    {selectedRecord.labs.map((lab, idx) => (
                      <li key={idx}>{formatDisplayDate(lab)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedRecord.visits && selectedRecord.visits.length > 0 && (
                <div style={detailSection}>
                  <h5 style={sectionTitle}>Visit History</h5>
                  {selectedRecord.visits.map((visit, idx) => (
                    <div key={idx} style={visitDetail}>
                      {visit.date && (
                        <div>
                          <strong>Date:</strong>{" "}
                          {new Date(visit.date).toLocaleDateString()}
                        </div>
                      )}
                      {visit.reason && (
                        <div>
                          <strong>Reason:</strong> {visit.reason}
                        </div>
                      )}
                      {visit.doctor && (
                        <div>
                          <strong>Doctor:</strong> {visit.doctor}
                        </div>
                      )}
                      {visit.summary && (
                        <div>
                          <strong>Summary:</strong> {visit.summary}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedRecord.immunizations &&
                selectedRecord.immunizations.length > 0 && (
                  <div style={detailSection}>
                    <h5 style={sectionTitle}>Immunizations</h5>
                    {selectedRecord.immunizations.map((imm, idx) => (
                      <div key={idx} style={visitDetail}>
                        {imm.name && (
                          <div>
                            <strong>Vaccine:</strong> {imm.name}
                          </div>
                        )}
                        {imm.by && (
                          <div>
                            <strong>Administered by:</strong> {imm.by}
                          </div>
                        )}
                        {imm.note && (
                          <div>
                            <strong>Notes:</strong> {imm.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>

          <div style={footer}>
            <button onClick={handleCloseDetail} style={closeButton}>
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div style={backdrop}>
      <div style={modal}>
        <div style={header}>
          <h3 style={{ margin: 0 }}>Old Medical Records</h3>
          <button onClick={onClose} style={closeBtn}>
            ✕
          </button>
        </div>

        <div style={scrollContent}>
          {loading && <LoadingSkeleton lines={5} />}
          {err && <ErrorBanner message={err} />}

          {!loading && !err && records.length === 0 && (
            <EmptyState
              title="No old records"
              subtitle="Historical records will appear here."
            />
          )}

          {!loading && !err && records.length > 0 && (
            <div style={recordsList}>
              {records.map((record, i) => (
                <div
                  key={record._id || i}
                  style={recordCard}
                  onClick={() => handleRecordClick(record)}
                >
                  <div style={recordHeader}>
                    <span style={recordRole}>
                      {record.providerName || record.providerRole}
                    </span>
                    <span style={recordDate}>
                      {formatDateTime(record.createdAt)}
                    </span>
                  </div>
                  <div style={recordNote}>{record.note}</div>
                  <div style={clickHint}>Click to view details →</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={footer}>
          <button onClick={onClose} style={closeButton}>
            Close
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

const backBtn = {
  background: "#f0f5ef",
  border: "1px solid #b9c8b4",
  fontSize: "14px",
  cursor: "pointer",
  color: "#2d3b2b",
  padding: "6px 12px",
  borderRadius: "6px",
};

const scrollContent = {
  flex: 1,
  overflowY: "auto",
  padding: "24px",
};

const footer = {
  padding: "16px 24px",
  borderTop: "1px solid #e5e5e5",
  display: "flex",
  justifyContent: "flex-end",
};

const closeButton = {
  padding: "8px 24px",
  borderRadius: 8,
  border: "1px solid #b9c8b4",
  background: "#6e8a69",
  color: "#fff",
  cursor: "pointer",
};

const recordsList = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const recordCard = {
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #b9c8b4",
  background: "#f0f5ef",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const recordHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "8px",
  paddingBottom: "8px",
  borderBottom: "1px solid #d7e3d2",
};

const recordRole = {
  fontWeight: "600",
  color: "#2d3b2b",
  fontSize: "14px",
};

const recordDate = {
  fontSize: "12px",
  color: "#5f6b6b",
};

const recordNote = {
  fontSize: "14px",
  color: "#2d3b2b",
  marginBottom: "8px",
};

const clickHint = {
  fontSize: "12px",
  color: "#6e8a69",
  fontWeight: "500",
  marginTop: "8px",
};

const detailViewContainer = {
  background: "#fff",
};

const detailHeader = {
  padding: "16px",
  background: "#f0f5ef",
  borderRadius: "8px",
  marginBottom: "16px",
};

const detailSection = {
  marginBottom: "20px",
  padding: "16px",
  background: "#f9faf9",
  borderRadius: "8px",
  border: "1px solid #e5e5e5",
};

const sectionTitle = {
  margin: "0 0 12px 0",
  fontSize: "16px",
  fontWeight: "600",
  color: "#2d3b2b",
  borderBottom: "2px solid #6e8a69",
  paddingBottom: "8px",
};

const sectionContent = {
  margin: 0,
  fontSize: "14px",
  color: "#2d3b2b",
  lineHeight: "1.6",
};

const detailsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "12px",
  fontSize: "14px",
};

const detailsList = {
  listStyle: "disc",
  marginLeft: "20px",
  marginTop: "8px",
  fontSize: "14px",
};

const visitDetail = {
  marginTop: "8px",
  padding: "12px",
  background: "#fff",
  borderRadius: "6px",
  fontSize: "13px",
  border: "1px solid #e5e5e5",
};
