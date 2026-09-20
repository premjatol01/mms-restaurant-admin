import { useState } from "react";
import { useOrdersStore } from "../../../store/ordersStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import EmptyState from "../../../components/ui/EmptyState";
import SessionCard from "./SessionCard";
import MarkPaidModal from "../modals/MarkPaidModal";
import RemoveItemModal from "../modals/RemoveItemModal";
import { getSessionOrders, getUnresolvedItems } from "../utils/orderUtils";

const FILTER_OPTIONS = [
  { value: "", label: "All Sessions" },
  { value: "ready", label: "Ready for payment" },
  { value: "unserved", label: "Has unserved items" },
];

export default function ActiveSessionsTab({ onViewOrder, onCancelOrder }) {
  const { sessions, orders, getTableName } = useOrdersStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [payTarget, setPayTarget] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);

  const rows = sessions
    .filter((session) => session.status === "active")
    .map((session) => {
      const sessionOrders = getSessionOrders(session, orders);
      return { session, orders: sessionOrders, unresolved: getUnresolvedItems(sessionOrders).length };
    })
    .sort((a, b) => new Date(a.session.startedAt) - new Date(b.session.startedAt));

  const term = search.trim().toLowerCase();
  const filteredRows = rows.filter(({ session, unresolved }) => {
    const matchSearch =
      !term ||
      getTableName(session.tableId).toLowerCase().includes(term) ||
      session.sessionNumber.toLowerCase().includes(term);
    const matchFilter =
      !filter || (filter === "unserved" ? unresolved > 0 : unresolved === 0);
    return matchSearch && matchFilter;
  });

  const hasFilters = search || filter;
  const clearFilters = () => {
    setSearch("");
    setFilter("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search table or session..." />
        </div>
        <Select value={filter} onChange={setFilter} options={FILTER_OPTIONS} className="w-full sm:w-48" />
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="text-sm text-[color:var(--color-primary)] hover:underline">
          Clear filters
        </button>
      )}

      {rows.length === 0 ? (
        <EmptyState
          title="No active table sessions"
          description="A session starts when a table places its first order and ends when the bill is paid."
        />
      ) : filteredRows.length === 0 ? (
        <div className="p-8 text-center text-secondary">No sessions match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
          {filteredRows.map(({ session, orders: sessionOrders }) => (
            <SessionCard
              key={session.id}
              session={session}
              orders={sessionOrders}
              onMarkPaid={setPayTarget}
              onRemoveItem={setRemoveTarget}
              onViewOrder={onViewOrder}
              onCancelOrder={onCancelOrder}
            />
          ))}
        </div>
      )}

      {payTarget && <MarkPaidModal sessionId={payTarget} onClose={() => setPayTarget(null)} />}
      {removeTarget && (
        <RemoveItemModal
          orderId={removeTarget.orderId}
          itemId={removeTarget.itemId}
          onClose={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
