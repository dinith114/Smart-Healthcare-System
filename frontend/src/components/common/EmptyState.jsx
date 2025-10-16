export default function EmptyState({ title = "Nothing here yet", subtitle }) {
  return (
    <div style={{ padding: "12px 0", color: "#5f6b6b" }}>
      <div style={{ fontWeight: 600 }}>{title}</div>
      {subtitle && <div>{subtitle}</div>}
    </div>
  );
}
