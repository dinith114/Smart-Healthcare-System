// src/pages/Records.jsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import LoadingSkeleton from "../components/common/LoadingSkeleton.jsx";
import ErrorBanner from "../components/common/ErrorBanner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import UpdateRecordModal from "../components/records/UpdateRecordModal.jsx";
import AuditTimeline from "../components/records/AuditTimeline.jsx";
import { formatDateTime } from "../utils/date";

// Cards
import PatientSummaryCard from "../components/records/PatientSummaryCard.jsx";
import ActionPanel from "../components/records/ActionPanel.jsx";
import MedicationsCard from "../components/records/MedicationsCard.jsx";
import LabResultsCard from "../components/records/LabResultsCard.jsx";
import VitalsCard from "../components/records/VitalsCard.jsx";
import VisitHistoryCard from "../components/records/VisitHistoryCard.jsx";
import ImmunizationsCard from "../components/records/ImmunizationsCard.jsx";

export default function Records({ patientId, role = "Patient" }) {
  const [record, setRecord] = useState(null);
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

  // Provider-only inline edit mode (toggled from ActionPanel)
  const [editMode, setEditMode] = useState(false);
  const canEdit = useMemo(() => role === "Provider", [role]);

  // Load records (encounters) + patient summary
  const fetchAll = async () => {
    setLoading(true);
    setErr("");
    try {
      const [recRes, sumRes] = await Promise.all([
        api.get(`/records/${patientId}`),
        api.get(`/patients/${patientId}/summary`),
      ]);
      setRecord(recRes.data || { encounters: [] });
      setSummary(sumRes.data || null);
      setLoading(false);
    } catch (e) {
      setErr(e.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [patientId]);

  // Toggle edit mode from the center card
  const onEditToggle = () => {
    if (!canEdit) return;
    setEditMode((e) => !e);
  };

  // Save summary changes to backend (PATCH)
  const onSaveSummary = async () => {
    try {
      const payload = {
        vitals: summary?.vitals,
        medications: summary?.medications,
        labs: summary?.labs,
        visits: summary?.visits,
        immunizations: summary?.immunizations,
      };
      await api.patch(`/patients/${patientId}/summary`, payload);
      setEditMode(false);
      alert("Summary updated");
    } catch (e) {
      alert(e.message || "Failed to save");
    }
  };

  if (loading)
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <LoadingSkeleton lines={8} />
      </div>
    );
  if (err)
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <ErrorBanner message={err} />
      </div>
    );

  const encounters = record?.encounters || [];

  return (
    <div className="min-h-screen bg-[#8aa082]/30">
      {/* Header */}
      <header className="bg-[#7e957a] text-white">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20" />
            <span className="font-semibold">Smart Healthcare</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a className="hover:underline" href="#">
              Home
            </a>
            <a className="hover:underline" href="#">
              About
            </a>
            <a className="hover:underline" href="#">
              Appointments
            </a>
            <a className="hover:underline" href="#">
              Payment
            </a>
          </nav>

          {/* Only "View History" and Logout on the right */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAuditOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-white/40 bg-white/10 hover:bg-white/20"
            >
              View History
            </button>
            {!canEdit && (
              <span className="px-3 py-1.5 rounded-full text-sm bg-white/20">
                Read-only
              </span>
            )}
            <button className="px-4 py-1.5 rounded-full bg-[#5b6f59] hover:bg-[#4f614e]">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <h2 className="text-2xl font-semibold text-[#2d3b2b] mb-4">
          Medical Records
        </h2>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-12 gap-5">
          {/* LEFT column — Patient Info, Vitals, Immunizations */}
          <div className="col-span-12 md:col-span-4 space-y-5">
            <PatientSummaryCard data={summary?.patient} />
            <VitalsCard
              vitals={summary?.vitals}
              editable={editMode}
              onChange={(v) => setSummary((s) => ({ ...s, vitals: v }))}
            />
            {/* moved here to fill the empty space */}
            <ImmunizationsCard
              items={summary?.immunizations || []}
              editable={editMode}
              onChange={(items) =>
                setSummary((s) => ({ ...s, immunizations: items }))
              }
            />
          </div>

          {/* CENTER column — Image/Actions + Encounters */}
          <div className="col-span-12 md:col-span-4 space-y-5">
            <ActionPanel
              canEdit={canEdit}
              editMode={editMode}
              onEdit={onEditToggle}
              onSave={onSaveSummary}
              onCancel={() => {
                setEditMode(false);
                fetchAll();
              }}
              onAdd={() => setModalOpen(true)}
            />

            <div className="rounded-2xl border border-[#b9c8b4] bg-[#f0f5ef] p-4 shadow-sm">
              <h3 className="font-semibold text-[#2f3e2d] mb-2">Encounters</h3>
              {encounters.length === 0 ? (
                <EmptyState
                  title="No encounters yet"
                  subtitle="New updates will appear here."
                />
              ) : (
                <ul className="divide-y divide-[#d7e3d2]">
                  {encounters.map((e, i) => (
                    <li key={i} className="py-2">
                      <div className="text-sm text-slate-600">
                        <strong className="text-[#2d3b2b]">
                          {e.authorRole}
                        </strong>{" "}
                        — {formatDateTime(e.at)}
                      </div>
                      <div>{e.note}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT column — Medications, Lab Results, Visit History */}
          <div className="col-span-12 md:col-span-4 space-y-5">
            <MedicationsCard
              items={summary?.medications || []}
              editable={editMode}
              onChange={(items) =>
                setSummary((s) => ({ ...s, medications: items }))
              }
            />
            <LabResultsCard
              items={summary?.labs || []}
              editable={editMode}
              onChange={(items) => setSummary((s) => ({ ...s, labs: items }))}
            />
            <VisitHistoryCard
              items={summary?.visits || []}
              editable={editMode}
              onChange={(items) => setSummary((s) => ({ ...s, visits: items }))}
            />
          </div>
        </div>
      </main>

      {/* Modals / Drawers */}
      <UpdateRecordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        patientId={patientId}
        onSaved={(updated) => setRecord(updated)}
      />
      <AuditTimeline
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
        patientId={patientId}
      />
    </div>
  );
}
