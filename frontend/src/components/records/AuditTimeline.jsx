import { useEffect, useState } from "react";
import { api, getDemoHeaders } from "../../services/api";
import LoadingSkeleton from "../common/LoadingSkeleton";
import ErrorBanner from "../common/ErrorBanner";
import EmptyState from "../common/EmptyState";
import { formatDateTime } from "../../utils/date";

export default function AuditTimeline({ patientId, open, onClose }) {
  const [data, setData] = useState([]);
  const [tab, setTab] = useState("ALL"); // ALL | VIEW | UPDATE
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setErr("");
    const demoHeaders = getDemoHeaders();
    api
      .get(`/audit/${patientId}`, { headers: demoHeaders })
      .then((r) => {
        setData(r.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setErr(
          e.response?.data?.error || e.response?.data?.message || e.message
        );
        setLoading(false);
      });
  }, [open, patientId]);

  if (!open) return null;

  const filtered = tab === "ALL" ? data : data.filter((x) => x.action === tab);

  return (
    <div style={drawerBackdrop}>
      <div style={drawer}>
        <div style={drawerHeader}>
          <strong>Audit Timeline</strong>
          <button onClick={onClose}>Close</button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {["ALL", "VIEW", "UPDATE"].map((k) => (
            <button key={k} onClick={() => setTab(k)} style={tabBtn(tab === k)}>
              {k}
            </button>
          ))}
        </div>

        {loading && <LoadingSkeleton lines={5} />}
        {err && <ErrorBanner message={err} />}
        {!loading && !err && filtered.length === 0 && (
          <EmptyState
            title="No audit entries"
            subtitle="Views and updates will appear here."
          />
        )}

        <ul style={{ listStyle: "none", paddingLeft: 0, marginTop: 8 }}>
          {filtered.map((a, i) => (
            <li
              key={i}
              style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}
            >
              <div>
                <strong>{a.actorRole}</strong> — {a.action} —{" "}
                {formatDateTime(a.timestamp)}
              </div>
              <div style={{ color: "#5f6b6b" }}>{a.details}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const drawerBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.25)",
  display: "flex",
  justifyContent: "flex-end",
  zIndex: 999,
};
const drawer = {
  width: 420,
  maxWidth: "90%",
  height: "100%",
  background: "#fff",
  padding: 16,
  borderLeft: "1px solid #e5e5e5",
};
const drawerHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
};
const tabBtn = (active) => ({
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #c7c7c7",
  background: active ? "#dcefe2" : "#fff",
});
