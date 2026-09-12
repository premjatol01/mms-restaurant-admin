import { useState } from "react";
import { toast } from "sonner";
import { useOrdersStore } from "../../../store/ordersStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import EmptyState from "../../../components/ui/EmptyState";
import SessionDetailsDrawer from "./SessionDetailsDrawer";
import ConfirmDialog from "../../tables-qr/components/ConfirmDialog";

export default function TableSessionsTab() {
  const { sessions, getTableName } = useOrdersStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewSession, setViewSession] = useState(null);
  const [confirmPayment, setConfirmPayment] = useState(null);
  const [confirmClose, setConfirmClose] = useState(null);

  const activeSessions = sessions.filter((s) => s.status === "active");

  const filteredSessions = activeSessions.filter((session) => {
    const matchSearch = !search || getTableName(session.tableId).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || session.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const clearFilters = () => { setSearch(""); setStatusFilter(""); };
  const hasFilters = search || statusFilter;

  const handleMarkPayment = () => {
    useOrdersStore.getState().markPaymentSuccessful(confirmPayment.id);
    toast.success("Payment marked as successful.");
    setConfirmPayment(null);
    if (viewSession) setViewSession(null);
  };

  const handleCloseSession = () => {
    useOrdersStore.getState().closeSession(confirmClose.id);
    toast.success("Table session closed successfully.");
    setConfirmClose(null);
    if (viewSession) setViewSession(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search table..." /></div>
        <Select value={statusFilter} onChange={setStatusFilter} options={[{ value: "", label: "All Status" }, { value: "pending", label: "Payment Pending" }, { value: "successful", label: "Payment Successful" }]} className="w-full sm:w-44" />
      </div>

      {hasFilters && <button onClick={clearFilters} className="text-sm text-primary hover:underline">Clear filters</button>}

      {!activeSessions.length ? (
        <EmptyState title="No active table sessions" description="There are currently no active sessions." />
      ) : filteredSessions.length === 0 ? (
        <div className="p-8 text-center text-secondary">No sessions match your filters.</div>
      ) : (
        <div className="overflow-x-auto border border-theme rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-primary-light/30 border-b border-theme">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-theme">Table</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Orders</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Started</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Total</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Payment</th>
                <th className="text-right px-4 py-3 font-medium text-theme">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => (
                <tr key={session.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10">
                  <td className="px-4 py-3 font-medium text-theme">{getTableName(session.tableId)}</td>
                  <td className="px-4 py-3 text-theme">{session.orderIds.length}</td>
                  <td className="px-4 py-3 text-secondary">{new Date(session.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-4 py-3 font-medium text-theme">₹{session.total}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${session.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                      {session.paymentStatus === "pending" ? "Payment Pending" : "Payment Successful"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setViewSession(session)} className="text-primary hover:underline text-sm">View Session</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewSession && (
        <SessionDetailsDrawer
          session={viewSession}
          onClose={() => setViewSession(null)}
          onMarkPayment={() => { setConfirmPayment(viewSession); setViewSession(null); }}
          onCloseSession={() => { setConfirmClose(viewSession); setViewSession(null); }}
        />
      )}

      {confirmPayment && (
        <ConfirmDialog
          title="Mark Payment Successful?"
          message={`Confirm that the consolidated bill of ₹${confirmPayment.total} has been collected manually.`}
          onConfirm={handleMarkPayment}
          onCancel={() => setConfirmPayment(null)}
          confirmLabel="Confirm Payment"
        />
      )}

      {confirmClose && (
        <ConfirmDialog
          title="Close Table Session?"
          message="The payment for this session has been marked as successful. Closing this session will make the table available for a new session."
          onConfirm={handleCloseSession}
          onCancel={() => setConfirmClose(null)}
          confirmLabel="Close Session"
        />
      )}
    </div>
  );
}