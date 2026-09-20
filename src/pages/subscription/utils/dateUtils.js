// Small, dependency-free date helpers. Date-only strings ("2026-09-20") are treated
// as LOCAL calendar dates so "days remaining" never shifts with the time zone.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function parseDate(value) {
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}

const pad = (n) => String(n).padStart(2, "0");

export const toISODate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Whole calendar days from b to a (a - b). DST-safe. */
export function diffCalendarDays(a, b) {
  const x = parseDate(a);
  const y = parseDate(b);
  const utcA = Date.UTC(x.getFullYear(), x.getMonth(), x.getDate());
  const utcB = Date.UTC(y.getFullYear(), y.getMonth(), y.getDate());
  return Math.round((utcA - utcB) / 86400000);
}

export function addDays(date, days) {
  const d = new Date(parseDate(date));
  d.setDate(d.getDate() + days);
  return d;
}

/** Adds months, clamping to the last day of the month (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(date, months) {
  const d = parseDate(date);
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d.getDate(), lastDay));
  return target;
}

export const addYears = (date, years) => addMonths(date, years * 12);

export function formatDate(value) {
  if (!value) return "—";
  const d = parseDate(value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = parseDate(value);
  const hours = d.getHours() % 12 || 12;
  return `${formatDate(d)}, ${hours}:${pad(d.getMinutes())} ${d.getHours() < 12 ? "AM" : "PM"}`;
}
