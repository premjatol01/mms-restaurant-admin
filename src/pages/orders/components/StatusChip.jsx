import { STATUS_COLORS, STATUS_LABELS } from "../constants";

export default function StatusChip({ status, className = "" }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap text-xs px-2 py-1 rounded-full font-medium ${
        STATUS_COLORS[status] || "bg-gray-100 text-gray-600"
      } ${className}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
