import { useState } from "react";
import { ClipboardList, Users, DollarSign, Clock } from "lucide-react";
import { useOrdersStore } from "../../store/ordersStore";
import ActiveOrdersTab from "./components/ActiveOrdersTab";
import TableSessionsTab from "./components/TableSessionsTab";
import CompletedTab from "./components/CompletedTab";

const TABS = [
  { id: "active", label: "Active Orders" },
  { id: "sessions", label: "Table Sessions" },
  { id: "completed", label: "Completed" },
];

function SummaryCards() {
  const { orders, sessions, completedSessions } = useOrdersStore();
  
  const activeOrders = orders.filter((o) => {
    const session = sessions.find((s) => s.id === o.sessionId);
    return session && session.status === "active";
  });
  
  const activeTablesCount = sessions.filter((s) => s.status === "active").length;
  const todayOrders = orders.length + completedSessions.reduce((sum, s) => sum + s.orderIds.length, 0);
  const todayRevenue = sessions.reduce((sum, s) => sum + s.total, 0) + 
    completedSessions.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-surface rounded-xl border border-theme p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <ClipboardList className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-secondary">Active Orders</p>
            <p className="text-xl font-bold text-theme">{activeOrders.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-surface rounded-xl border border-theme p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Users className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-secondary">Active Tables</p>
            <p className="text-xl font-bold text-theme">{activeTablesCount}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-surface rounded-xl border border-theme p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Clock className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-secondary">Today's Orders</p>
            <p className="text-xl font-bold text-theme">{todayOrders}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-surface rounded-xl border border-theme p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <DollarSign className="text-amber-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-secondary">Today's Revenue</p>
            <p className="text-xl font-bold text-theme">₹{todayRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("active");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-theme">Orders</h1>
        <p className="text-sm text-secondary">Manage customer orders, table sessions and payments.</p>
      </div>

      <SummaryCards />

      <div className="bg-surface rounded-xl border border-theme overflow-hidden">
        <div className="flex border-b border-theme">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-theme hover:bg-primary-light"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "active" && <ActiveOrdersTab />}
          {activeTab === "sessions" && <TableSessionsTab />}
          {activeTab === "completed" && <CompletedTab />}
        </div>
      </div>
    </div>
  );
}