import { useState, useEffect } from "react";
import { ChefHat, ClipboardList, IndianRupee, Users } from "lucide-react";
import { isToday } from "date-fns";
import { useOrdersStore } from "../../store/ordersStore";
import { useTablesQRStore } from "../../store/tablesQRStore";
import { useMenuStore } from "../../store/menuStore";
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

import { toast } from "sonner";
import { connectAdminSocket, disconnectAdminSocket } from "../../services/socket";
import { useProfileStore } from "../../store/profileStore";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [viewOrderId, setViewOrderId] = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const pendingCount = useOrdersStore((state) => state.orders.filter((o) => o.status === "pending").length);
  const fetchData = useOrdersStore((state) => state.fetchData);

  useEffect(() => {
    fetchData();
    useTablesQRStore.getState().fetchData();
    useMenuStore.getState().fetchMenuData();

    let isMounted = true;

    // Connect real-time WebSocket for instant order alerts & session updates
    const setupSocket = async () => {
      let rId = useProfileStore.getState().profile?._id;
      if (!rId) {
        await useProfileStore.getState().fetchProfile();
        rId = useProfileStore.getState().profile?._id;
      }

      if (!isMounted) return;

      connectAdminSocket(rId, {
        onOrderCreated: (data) => {
          const orderNum = data?.order?.orderNumber || "New";
          const tableNum = data?.table?.tableNo ? ` (Table ${data.table.tableNo})` : "";
          toast.success(`⚡ New QR Order ${orderNum}${tableNum} placed!`, {
            duration: 6000,
          });
          useOrdersStore.getState().fetchData();
        },
        onOrderStatusUpdated: () => {
          useOrdersStore.getState().fetchData();
        },
        onSessionUpdated: () => {
          useOrdersStore.getState().fetchData();
        },
      });
    };

    setupSocket();

    return () => {
      isMounted = false;
      disconnectAdminSocket();
    };
  }, [fetchData]);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex-none mb-3 flex flex-col lg:flex-row lg:items-end lg:justify-end gap-4">
        <ExportControls />
      </div>

      <div className="flex-none mb-4">
        <SummaryCards />
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-surface rounded-xl border border-theme overflow-hidden shadow-sm">
        <div className="flex-none flex border-b border-theme bg-surface" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.id ? "border-b-2 border-primary text-primary font-semibold" : "text-secondary hover:text-theme"
              }`}
            >
              {tab.label}
              {tab.id === "pending" && <AnimatedCount variant="badge" value={pendingCount} />}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 flex flex-col p-4 overflow-hidden">
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
