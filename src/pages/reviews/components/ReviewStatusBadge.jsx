const LABELS = { pending: "Pending", accepted: "Accepted", rejected: "Rejected" };
const COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function ReviewStatusBadge({ status }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${COLORS[status]}`}>
      {LABELS[status]}
    </span>
  );
}
