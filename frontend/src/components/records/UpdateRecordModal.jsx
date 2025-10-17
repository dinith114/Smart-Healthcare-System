import { useState } from "react";
import { api, getDemoHeaders } from "../../services/api";

export default function UpdateRecordModal({
  open,
  onClose,
  patientId,
  onSaved,
}) {
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setErr("");
    const trimmed = note.trim();
    if (trimmed.length < 3) {
      setErr("Note must be at least 3 characters.");
      return;
    }
    setSaving(true);
    try {
      const demoHeaders = getDemoHeaders();
      const res = await api.post(
        `/records/${patientId}/encounters`,
        {
          note: trimmed,
          authorRole: "Provider",
        },
        { headers: demoHeaders }
      );
      setSaving(false);
      setNote("");
      onSaved?.(res.data);
      onClose?.();
      alert("Update saved");
    } catch (e) {
      setSaving(false);
      setErr(e.response?.data?.error || e.response?.data?.message || e.message);
    }
  };

  return (
    <div style={backdrop}>
      <div style={modal}>
        <h3 style={{ marginTop: 0 }}>Add/Update Record</h3>
        <textarea
          rows={5}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add provider note…"
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #c7c7c7",
          }}
        />
        {err && <div style={{ color: "crimson", marginTop: 6 }}>{err}</div>}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
          }}
        >
          <button onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button onClick={submit} disabled={saving || !note.trim()}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};
const modal = {
  background: "#fff",
  width: 520,
  maxWidth: "90%",
  borderRadius: 10,
  padding: 16,
};
