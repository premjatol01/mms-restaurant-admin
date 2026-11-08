import { useState } from "react";
import { Clock, CheckCircle, XCircle, History, Eye, MessageSquare, Plus, FileText, CornerDownRight } from "lucide-react";
import Button from "../../../components/ui/Button";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function PlanHistoryAndTickets({ history = [], tickets = [], onViewScreenshot, onRaiseTicket }) {
  const [activeTab, setActiveTab] = useState("history"); // "history" | "tickets"

  return (
    <div className="bg-surface rounded-xl border border-theme p-6 space-y-5 shadow-sm">
      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === "history"
                ? "bg-primary text-white shadow-xs"
                : "text-secondary hover:text-theme hover:bg-primary-light/40"
            }`}
          >
            <History size={16} />
            Payment & Plan History ({history.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tickets")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === "tickets"
                ? "bg-primary text-white shadow-xs"
                : "text-secondary hover:text-theme hover:bg-primary-light/40"
            }`}
          >
            <MessageSquare size={16} />
            Support Tickets & Notes ({tickets.length})
          </button>
        </div>

        {activeTab === "tickets" && (
          <Button size="sm" onClick={onRaiseTicket}>
            <Plus size={14} /> Raise Ticket / Add Note
          </Button>
        )}
      </div>

      {/* Tab 1: Payment & Plan History */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-theme rounded-xl">
              <History size={32} className="mx-auto text-secondary mb-2" />
              <h4 className="text-sm font-semibold text-theme">No payment history yet</h4>
              <p className="text-xs text-secondary mt-1">Your payment requests and renewals will show here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-theme rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-primary-light/20 border-b border-theme text-xs font-semibold text-secondary">
                  <tr>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Plan & Duration</th>
                    <th className="text-left px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">UTR / Ref</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Admin Remarks</th>
                    <th className="text-center px-4 py-3">Screenshot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {history.map((req) => {
                    const isPending = req.status === "pending";
                    const isConfirmed = req.status === "confirmed" || req.status === "approved";
                    const isRejected = req.status === "rejected";

                    return (
                      <tr key={req._id || req.id} className="hover:bg-primary-light/10 transition-colors">
                        <td className="px-4 py-3 text-xs text-theme whitespace-nowrap">{formatDate(req.requestedAt || req.createdAt)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-semibold text-theme text-xs">{req.planName}</p>
                          <p className="text-[11px] text-secondary">{req.durationDisplay || (req.durationDays ? `${req.durationDays} Days` : "—")}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-theme whitespace-nowrap">
                          ₹{Number(req.amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-xs text-secondary font-mono whitespace-nowrap">
                          {req.transactionRef || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock size={11} className="animate-spin" /> Pending Verification
                            </span>
                          )}
                          {isConfirmed && (
                            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-green-100 text-green-700 border border-green-200">
                              <CheckCircle size={11} /> Confirmed & Active
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-red-100 text-red-700 border border-red-200">
                              <XCircle size={11} /> Rejected
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-secondary max-w-xs truncate">
                          {isPending ? "Awaiting super admin verification" : req.reviewNote || "Payment verified successfully"}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {(req.screenshotUrl || req.screenshot?.url || req.screenshot?.dataUrl) ? (
                            <Button size="sm" variant="ghost" onClick={() => onViewScreenshot(req)}>
                              <Eye size={13} /> View
                            </Button>
                          ) : (
                            <span className="text-xs text-secondary">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Support Tickets & Notes */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-theme rounded-xl">
              <MessageSquare size={32} className="mx-auto text-secondary mb-2" />
              <h4 className="text-sm font-semibold text-theme">No tickets or notes yet</h4>
              <p className="text-xs text-secondary mt-1">
                Have a question or need an update on your payment? Click "Raise Ticket / Add Note".
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((tkt) => {
                const isOpen = tkt.status === "open";
                const isInProgress = tkt.status === "in_progress";
                const isResolved = tkt.status === "resolved";

                return (
                  <div key={tkt._id || tkt.id} className="p-4 rounded-xl border border-theme bg-surface space-y-2.5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-light text-primary">
                          {tkt.ticketNumber}
                        </span>
                        <h4 className="text-sm font-bold text-theme">{tkt.subject}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-secondary">{formatDate(tkt.createdAt)}</span>
                        {isOpen && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">
                            Open
                          </span>
                        )}
                        {isInProgress && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800">
                            In Progress
                          </span>
                        )}
                        {isResolved && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-800">
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-theme bg-surface/80 p-3 rounded-lg border border-theme/40 leading-relaxed">
                      {tkt.message}
                    </p>

                    {/* Admin Reply */}
                    {tkt.adminReply && (
                      <div className="mt-2.5 p-3 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/50 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-800 dark:text-green-300">
                          <CornerDownRight size={13} />
                          <span>Super Admin Reply ({formatDate(tkt.repliedAt)}):</span>
                        </div>
                        <p className="text-xs text-green-900 dark:text-green-200 pl-4">{tkt.adminReply}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
