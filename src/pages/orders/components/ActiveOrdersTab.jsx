import { useState } from "react";
import { Plus, Search, Clock, QrCode, FileText } from "lucide-react";
import { toast } from "sonner";
import { useOrdersStore } from "../../../store/ordersStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import OrderDetailsDrawer from "./OrderDetailsDrawer";
import ManualOrderDrawer from "./ManualOrderDrawer";
import SessionDetailsDrawer from "./SessionDetailsDrawer";

const STATUS_COLORS = { 
  new: "bg-blue-100 text-blue-700", 
  preparing: "bg-yellow-100 text-yellow-700", 
  ready: "bg-green-100 text-green-700", 
  served: "bg-purple-100 text-purple-700", 
  cancelled: "bg-red-100 text-red-700" 
};

const STATUS_LABELS = { 
  new: "New", 
  preparing: "Preparing", 
  ready: "Ready", 
  served: "Served", 
  cancelled: "Cancelled" 
};

export default function ActiveOrdersTab() {
  const { orders, sessions, getTableName } = useOrdersStore();
  const [search, setSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewOrder, setViewOrder] = useState(null);
  const [showManualOrder, setShowManualOrder] = useState(false);
  const [viewSessionFromOrder, setViewSessionFromOrder] = useState(null);

  const activeOrders = orders.filter((o) => {
    const session = sessions.find((s) => s.id === o.sessionId);
    return session && session.status === "active";
  });

  const filteredOrders = activeOrders.filter((order) => {
    const matchSearch = !search || 
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) || 
      getTableName(order.tableId).toLowerCase().includes(search.toLowerCase()) || 
      order.customer?.mobile?.includes(search);
    const matchTable = !tableFilter || order.tableId === tableFilter;
    const matchStatus = !statusFilter || order.status === statusFilter;
    return matchSearch && matchTable && matchStatus;
  });

  const clearFilters = () => { setSearch(""); setTableFilter(""); setStatusFilter(""); };
  const hasFilters = search || tableFilter || statusFilter;

  const tables = [...new Set(sessions.filter((s) => s.status === "active").map((s) => s.tableId))];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search orders..." />
        </div>
        <Select 
          value={tableFilter} 
          onChange={setTableFilter} 
          options={[{ value: "", label: "All Tables" }, ...tables.map((t) => ({ value: t, label: getTableName(t) }))]} 
          className="w-full sm:w-40" 
        />
        <Select 
          value={statusFilter} 
          onChange={setStatusFilter} 
          options={[
            { value: "", label: "All Status" }, 
            { value: "new", label: "New" }, 
            { value: "preparing", label: "Preparing" }, 
            { value: "ready", label: "Ready" }, 
            { value: "served", label: "Served" },
            { value: "cancelled", label: "Cancelled" }
          ]} 
          className="w-full sm:w-36" 
        />
        <Button onClick={() => setShowManualOrder(true)}>
          <Plus size={16} /> Add Manual Order
        </Button>
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="text-sm text-primary hover:underline">
          Clear filters
        </button>
      )}

      {!activeOrders.length ? (
        <EmptyState 
          title="No active orders" 
          description="New customer orders will appear here when customers place orders through the QR menu." 
          actionLabel="+ Add Manual Order" 
          onAction={() => setShowManualOrder(true)} 
        />
      ) : filteredOrders.length === 0 ? (
        <div className="p-8 text-center text-secondary">No orders match your filters.</div>
      ) : (
        <div className="overflow-x-auto border border-theme rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-primary-light/30 border-b border-theme">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-theme">Order</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Table</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Items</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Time</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Status</th>
                <th className="text-right px-4 py-3 font-medium text-theme">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-theme">{order.orderNumber}</span>
                      {order.source === "manual" && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Manual</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-theme">{getTableName(order.tableId)}</td>
                  <td className="px-4 py-3 text-theme">{order.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                  <td className="px-4 py-3 font-medium text-theme">₹{order.total}</td>
                  <td className="px-4 py-3 text-secondary">{order.customer?.mobile || "—"}</td>
                  <td className="px-4 py-3 text-secondary">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setViewOrder(order)} className="text-primary hover:underline text-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewOrder && (
        <OrderDetailsDrawer 
          order={viewOrder} 
          onClose={() => setViewOrder(null)} 
          onViewSession={(session) => { setViewOrder(null); setViewSessionFromOrder(session); }}
        />
      )}
      {viewSessionFromOrder && (
        <SessionDetailsDrawer
          session={viewSessionFromOrder}
          onClose={() => setViewSessionFromOrder(null)}
          onMarkPayment={() => { useOrdersStore.getState().markPaymentSuccessful(viewSessionFromOrder.id); setViewSessionFromOrder(null); }}
          onCloseSession={() => { useOrdersStore.getState().closeSession(viewSessionFromOrder.id); setViewSessionFromOrder(null); }}
        />
      )}
      {showManualOrder && <ManualOrderDrawer isOpen={showManualOrder} onClose={() => setShowManualOrder(false)} />}
    </div>
  );
}