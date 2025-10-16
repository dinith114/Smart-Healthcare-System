export default function LoadingSkeleton({ lines = 3 }) {
  return (
    <div style={{ padding: 16 }}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          style={{
            height: 12,
            background: "#e0e0e0",
            marginBottom: 8,
            borderRadius: 4,
          }}
        />
      ))}
    </div>
  );
}
