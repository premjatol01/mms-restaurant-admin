import { useState } from "react";
import { ChefHat, ClipboardList, IndianRupee, Users } from "lucide-react";
import { isToday } from "date-fns";
import { useOrdersStore } from "../../store/ordersStore";
import PendingOrdersTab from "./components/PendingOrdersTab";
import ActiveSessionsTab from "./components/ActiveSessionsTab";
import CompletedTab from "./components/CompletedTab";
import ExportControls from "./components/ExportControls";
import AnimatedCount from "./components/AnimatedCount";
import OrderDetailsDrawer from "./components/OrderDetailsDrawer";
import CancelOrderModal from "./modals/CancelOrderModal";
import { formatCurrency } from "./utils/orderUtils";

const TABS = [
  { id: "pending", label: "Pending Orders" },
  { id: "sessions", label: "Active Table Sessions" },
  { id: "completed", label: "Completed Sessions" },
];

function StatCard({ icon: Icon, iconBg, iconColor, label, children }) {
  return (
    <div className="bg-surface rounded-xl border border-theme p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={iconColor} size={20} />
        </div>
        <div>
          <p className="text-xs text-secondary">{label}</p>
          <p className="text-xl font-bold text-theme">{children}</p>
        </div>
      </div>
    </div>
  );
}

function SummaryCards() {
  const orders = useOrdersStore((state) => state.orders);
  const sessions = useOrdersStore((state) => state.sessions);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const processingCount = orders.filter((o) => o.status === "processing").length;
  const todayRevenue = orders
    .filter((o) => isToday(new Date(o.createdAt)))
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={ClipboardList} iconBg="bg-yellow-100" iconColor="text-yellow-600" label="Pending Orders">
        <AnimatedCount value={pendingCount} />
      </StatCard>
      <StatCard icon={ChefHat} iconBg="bg-blue-100" iconColor="text-blue-600" label="Under Process">
        <AnimatedCount value={processingCount} />
      </StatCard>
      <StatCard icon={Users} iconBg="bg-purple-100" iconColor="text-purple-600" label="Active Tables">
        {sessions.length}
      </StatCard>
      <StatCard icon={IndianRupee} iconBg="bg-green-100" iconColor="text-green-600" label="Today's Revenue">
        {formatCurrency(todayRevenue)}
      </StatCard>
    </div>
  );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [viewOrderId, setViewOrderId] = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const pendingCount = useOrdersStore((state) => state.orders.filter((o) => o.status === "pending").length);

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-theme">Orders</h1>
          <p className="text-sm text-secondary">Manage customer orders, table sessions and payments.</p>
        </div>
        <ExportControls />
      </div>

      <SummaryCards />

      <div className="bg-surface rounded-xl border border-theme overflow-hidden">
        <div className="flex border-b border-theme" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-primary text-white" : "text-theme hover:bg-primary-light"
              }`}
            >
              {tab.label}
              {tab.id === "pending" && <AnimatedCount variant="badge" value={pendingCount} />}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "pending" && (
            <PendingOrdersTab onViewOrder={setViewOrderId} onCancelOrder={setCancelOrderId} />
          )}
          {activeTab === "sessions" && (
            <ActiveSessionsTab onViewOrder={setViewOrderId} onCancelOrder={setCancelOrderId} />
          )}
          {activeTab === "completed" && (
            <CompletedTab />
          )}
        </div>
      </div>

      {viewOrderId && (
        <OrderDetailsDrawer
          orderId={viewOrderId}
          onClose={() => setViewOrderId(null)}
          onCancel={setCancelOrderId}
        />
      )}
      {cancelOrderId && (
        <CancelOrderModal orderId={cancelOrderId} onClose={() => setCancelOrderId(null)} />
      )}
    </div>
  );
}
