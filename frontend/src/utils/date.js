// src/utils/date.js
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// Turn "2025 - March - 21" OR "2025-03-21" into "2025-03-21" for <input type="date">
export function toDateInputValue(s) {
  if (!s) return "";
  // already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s.trim())) return s.trim();

  // try "YYYY - Month - DD"
  const m = s.match(/^\s*(\d{4})\s*-\s*([A-Za-z]+)\s*-\s*(\d{1,2})\s*$/);
  if (m) {
    const year = m[1];
    const monthName = m[2].toLowerCase();
    const day = m[3].padStart(2, "0");
    const idx = MONTHS.findIndex((x) => x.toLowerCase() === monthName);
    if (idx >= 0) {
      const mm = String(idx + 1).padStart(2, "0");
      return `${year}-${mm}-${day}`;
    }
  }

  // final attempt: Date.parse
  const d = new Date(s);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);

  return "";
}

// For showing a friendly label in pills
export function formatDisplayDate(s) {
  const v = toDateInputValue(s);
  if (!v) return s || "-";
  const [y, m, d] = v.split("-");
  const month = MONTHS[Number(m) - 1].slice(0, 3); // Mar
  return `${y} - ${month} - ${d}`;
}
