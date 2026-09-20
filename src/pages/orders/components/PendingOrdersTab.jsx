import { useEffect, useState } from "react";
import { ChefHat, Clock, Plus } from "lucide-react";
import { useOrdersStore } from "../../../store/ordersStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import OrderCard from "./OrderCard";
import ManualOrderDrawer from "./ManualOrderDrawer";
import { STATUS_COLORS } from "../constants";

const byOldestFirst = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);

function OrderColumn({ status, title, icon: Icon, iconClass, emptyText, orders, onViewOrder, onCancelOrder }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-theme">
          <Icon size={18} className={iconClass} /> {title}
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[status]}`}>
          {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-theme p-6 text-center text-sm text-secondary">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onView={onViewOrder} onCancel={onCancelOrder} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function PendingOrdersTab({ onViewOrder, onCancelOrder }) {
  const { orders, getTableName } = useOrdersStore();
  const [search, setSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [showManualOrder, setShowManualOrder] = useState(false);
  const [, setTick] = useState(0);

  // Re-render every 30s so "5 minutes ago" stays fresh.
  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const openOrders = orders.filter((o) => o.status === "pending" || o.status === "processing");

  const term = search.trim().toLowerCase();
  const filtered = openOrders.filter((order) => {
    const matchSearch =
      !term ||
      order.orderNumber.toLowerCase().includes(term) ||
      getTableName(order.tableId).toLowerCase().includes(term) ||
      order.customer?.mobile?.includes(search.trim());
    const matchTable = !tableFilter || order.tableId === tableFilter;
    return matchSearch && matchTable;
  });

  // Oldest first, so the order that has waited longest is at the top.
  const pending = filtered.filter((o) => o.status === "pending").sort(byOldestFirst);
  const processing = filtered.filter((o) => o.status === "processing").sort(byOldestFirst);

  const tableIds = [...new Set(openOrders.map((o) => o.tableId))];
  const hasFilters = search || tableFilter;
  const clearFilters = () => {
    setSearch("");
    setTableFilter("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search order, table or mobile..." />
        </div>
        <Select
          value={tableFilter}
          onChange={setTableFilter}
          options={[{ value: "", label: "All Tables" }, ...tableIds.map((t) => ({ value: t, label: getTableName(t) }))]}
          className="w-full sm:w-40"
        />
        <Button onClick={() => setShowManualOrder(true)}>
          <Plus size={16} /> Add Manual Order
        </Button>
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="text-sm text-[color:var(--color-primary)] hover:underline">
          Clear filters
        </button>
      )}

      {openOrders.length === 0 ? (
        <EmptyState
          title="No pending orders"
          description="New QR and manual orders appear here until they are served."
          actionLabel="+ Add Manual Order"
          onAction={() => setShowManualOrder(true)}
        />
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-secondary">No orders match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          <OrderColumn
            status="pending"
            title="Pending"
            icon={Clock}
            iconClass="text-yellow-600"
            emptyText="No pending orders."
            orders={pending}
            onViewOrder={onViewOrder}
            onCancelOrder={onCancelOrder}
          />
          <OrderColumn
            status="processing"
            title="Under Process"
            icon={ChefHat}
            iconClass="text-blue-600"
            emptyText="Nothing is being prepared right now."
            orders={processing}
            onViewOrder={onViewOrder}
            onCancelOrder={onCancelOrder}
          />
        </div>
      )}

      {showManualOrder && (
        <ManualOrderDrawer isOpen={showManualOrder} onClose={() => setShowManualOrder(false)} />
      )}
    </div>
  );
}
