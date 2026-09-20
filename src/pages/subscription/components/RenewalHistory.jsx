import { Clock, CheckCircle, XCircle, Receipt } from "lucide-react";
import StateMessage from "./StateMessage";
import { RENEWAL_STATUS } from "../data/subscriptionConfig";
import { formatDateTime, formatDate, parseDate } from "../utils/dateUtils";
import { formatCurrency } from "../utils/subscriptionUtils";

const STATUS_ICONS = { pending: Clock, approved: CheckCircle, rejected: XCircle };

function StatusBadge({ status }) {
  const meta = RENEWAL_STATUS[status];
  const Icon = STATUS_ICONS[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${meta.badge}`}>
      <Icon size={12} /> {meta.label}
    </span>
  );
}

function getRemarks(request) {
  if (request.status === "pending") return "Awaiting verification by our team.";
  if (request.status === "approved") return `Activated on ${formatDate(request.reviewedAt)}.`;
  return request.reviewNote || "Payment could not be verified.";
}

export default function RenewalHistory({ requests, onViewScreenshot }) {
  const sorted = [...requests].sort((a, b) => parseDate(b.requestedAt) - parseDate(a.requestedAt));

  return (
    <div className="bg-surface rounded-xl border border-theme p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-theme">Renewal Requests</h2>
        <p className="text-sm text-secondary">Track the payment screenshots you've submitted and their review status.</p>
      </div>

      {sorted.length === 0 ? (
        <StateMessage
          icon={Receipt}
          title="No renewal requests yet"
          description="When you submit a renewal request, it will appear here with its review status."
        />
      ) : (
        <div className="overflow-x-auto border border-theme rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-primary-light/30 border-b border-theme">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-theme">Requested On</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Screenshot</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Reference</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Status</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((request) => (
                <tr key={request.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10 align-top">
                  <td className="px-4 py-3 text-theme whitespace-nowrap">{formatDateTime(request.requestedAt)}</td>
                  <td className="px-4 py-3 text-theme whitespace-nowrap">{formatCurrency(request.amount)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onViewScreenshot(request)}
                      aria-label={`View payment screenshot from ${formatDate(request.requestedAt)}`}
                      className="w-10 h-10 rounded-lg overflow-hidden border border-theme hover:opacity-80 transition-opacity"
                    >
                      <img src={request.screenshot.dataUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-secondary">{request.transactionRef || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={request.status} /></td>
                  <td className="px-4 py-3 text-secondary min-w-[14rem]">{getRemarks(request)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
