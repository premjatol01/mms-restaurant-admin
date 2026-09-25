import { Clock, CheckCircle, XCircle, History, Eye } from "lucide-react";
import StateMessage from "./StateMessage";
import Button from "../../../components/ui/Button";
import { RENEWAL_STATUS } from "../data/subscriptionConfig";
import { formatDateTime, formatDate, parseDate } from "../utils/dateUtils";
import { formatCurrency } from "../utils/subscriptionUtils";

const STATUS_ICONS = { pending: Clock, approved: CheckCircle, rejected: XCircle };

function StatusBadge({ status }) {
  const meta = RENEWAL_STATUS[status];
  const Icon = STATUS_ICONS[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${meta.badge}`}>
      <Icon size={11} /> {meta.label}
    </span>
  );
}

function getRemarks(request) {
  if (request.status === "pending") return "Awaiting verification by our team.";
  if (request.status === "approved") return `Activated on ${formatDate(request.reviewedAt)}.`;
  return request.reviewNote || "Payment could not be verified.";
}

/**
 * PlanHistory — shows past renewal requests without cluttered screenshot thumbnails.
 * Screenshots are still viewable via the "View" button.
 */
export default function PlanHistory({ requests, onViewScreenshot }) {
  const sorted = [...requests].sort((a, b) => parseDate(b.requestedAt) - parseDate(a.requestedAt));

  return (
    <div className="bg-surface rounded-xl border border-theme p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-theme">Plan History</h2>
        <p className="text-sm text-secondary">All your past renewal requests and their review outcomes.</p>
      </div>

      {sorted.length === 0 ? (
        <StateMessage
          icon={History}
          title="No history yet"
          description="Your renewal requests will appear here once you submit one."
        />
      ) : (
        <div className="overflow-x-auto border border-theme rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-primary-light/30 border-b border-theme">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-theme whitespace-nowrap">Requested On</th>
                <th className="text-left px-4 py-3 font-medium text-theme whitespace-nowrap">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-theme whitespace-nowrap">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-theme whitespace-nowrap">UTR / Ref</th>
                <th className="text-left px-4 py-3 font-medium text-theme whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 font-medium text-theme whitespace-nowrap">Remarks</th>
                <th className="text-left px-4 py-3 font-medium text-theme whitespace-nowrap">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-theme last:border-0 hover:bg-primary-light/10 align-middle"
                >
                  <td className="px-4 py-3 text-theme whitespace-nowrap">{formatDateTime(request.requestedAt)}</td>
                  <td className="px-4 py-3 text-theme font-medium whitespace-nowrap">{request.planName || "—"}</td>
                  <td className="px-4 py-3 text-theme whitespace-nowrap">{formatCurrency(request.amount)}</td>
                  <td className="px-4 py-3 text-secondary">{request.transactionRef || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-4 py-3 text-secondary min-w-[12rem]">{getRemarks(request)}</td>
                  <td className="px-4 py-3">
                    {request.screenshot?.dataUrl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewScreenshot(request)}
                        aria-label="View payment receipt"
                      >
                        <Eye size={13} />
                        View
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
