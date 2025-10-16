export default function ErrorBanner({ message }) {
  return (
    <div
      style={{
        background: "#fdecea",
        color: "#611a15",
        padding: "10px 14px",
        borderRadius: 6,
      }}
    >
      <strong>Error:</strong> {message}
    </div>
  );
}
