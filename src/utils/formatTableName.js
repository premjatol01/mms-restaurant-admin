/**
 * Formats a table name for display with "Table" prefix.
 * e.g. "12" -> "Table 12", "Table 12" -> "Table 12", 5 -> "Table 5"
 */
export function formatTableName(rawName, fallback = "Table") {
  if (!rawName) return fallback;
  const trimmed = String(rawName).trim();

  // If rawName is a 24-char hex MongoDB ObjectId, don't show it raw
  if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
    return fallback;
  }

  // If already starts with "Table" (case-insensitive, e.g. "Table 1", "Table-2")
  if (/^table[\s-]/i.test(trimmed)) {
    return trimmed;
  }

  // If it's a numeric string or plain value, prefix with "Table "
  return `Table ${trimmed}`;
}
