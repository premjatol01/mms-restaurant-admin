import { X, Clock, QrCode, User, FileText } from "lucide-react";
import { useOrdersStore } from "../../../store/ordersStore";
import Button from "../../../components/ui/Button";

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

export default function OrderDetailsDrawer({ order, onClose, onViewSession }) {
  const { sessions, getTableName } = useOrdersStore();
  const session = sessions.find((s) => s.id === order.sessionId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-md h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
          <h2 className="text-lg font-semibold text-theme">{order.orderNumber}</h2>
          <button onClick={onClose} className="p-1 text-secondary hover:text-theme rounded">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Order Info */}
          <div className="space-y-3">
            <h3 className="font-medium text-theme">Order Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-secondary">Table</span></div>
              <div className="text-theme font-medium">{getTableName(order.tableId)}</div>
              <div><span className="text-secondary">Order Time</span></div>
              <div className="text-theme">
                {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div><span className="text-secondary">Order Source</span></div>
              <div className="text-theme">{order.source === "qr" ? "QR Menu" : "Manual Order"}</div>
              <div><span className="text-secondary">Status</span></div>
              <div>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="space-y-2">
            <h3 className="font-medium text-theme flex items-center gap-2">
              <User size={16} /> Customer
            </h3>
            <p className="text-sm text-secondary">
              {order.customer?.mobile || "Contact number not provided"}
            </p>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <h3 className="font-medium text-theme flex items-center gap-2">
              <FileText size={16} /> Items
            </h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div className="text-theme">
                    {item.name} <span className="text-secondary">× {item.quantity}</span>
                  </div>
                  <div className="text-theme">₹{item.price * item.quantity}</div>
                </div>
              ))}
              <div className="border-t border-theme pt-2 flex justify-between font-medium">
                <span className="text-theme">Total</span>
                <span className="text-theme">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Table Session */}
          {session && (
            <div className="space-y-3">
              <h3 className="font-medium text-theme flex items-center gap-2">
                <QrCode size={16} /> Table Session
              </h3>
              <div className="bg-primary-light/20 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Session</span>
                  <span className="text-theme">{session.sessionNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Orders</span>
                  <span className="text-theme">{session.orderIds.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Session Total</span>
                  <span className="text-theme font-medium">₹{session.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Status</span>
                  <span className="text-theme capitalize">
                    {session.paymentStatus === "pending" ? "Payment Pending" : "Payment Successful"}
                  </span>
                </div>
              </div>

              {onViewSession && (
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => { onClose(); onViewSession(session); }}
                >
                  View Table Session
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-theme">
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}