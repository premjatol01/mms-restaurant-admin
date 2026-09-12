import { X, Clock, CheckCircle, DollarSign, FileText, Users } from "lucide-react";
import { useOrdersStore } from "../../../store/ordersStore";

export default function CompletedSessionDetails({ session, onClose }) {
  const { getTableName, getOrdersBySession } = useOrdersStore();
  const sessionOrders = getOrdersBySession(session.id);

  // Build consolidated items from all orders
  const consolidatedItems = {};
  sessionOrders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.menuItemId || item.name;
      if (consolidatedItems[key]) {
        consolidatedItems[key].quantity += item.quantity;
        consolidatedItems[key].total += item.price * item.quantity;
      } else {
        consolidatedItems[key] = {
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        };
      }
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-md h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
          <div>
            <h2 className="text-lg font-semibold text-theme">{session.sessionNumber}</h2>
            <p className="text-sm text-secondary">{getTableName(session.tableId)}</p>
          </div>
          <button onClick={onClose} className="p-1 text-secondary hover:text-theme rounded">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Session Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">
              Completed
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              session.paymentStatus === "successful" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              Payment {session.paymentStatus}
            </span>
          </div>

          {/* Session Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary-light/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <Clock size={14} />
                <span className="text-xs">Started</span>
              </div>
              <p className="text-sm font-medium text-theme">
                {new Date(session.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="bg-primary-light/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <Clock size={14} />
                <span className="text-xs">Closed</span>
              </div>
              <p className="text-sm font-medium text-theme">
                {session.closedAt ? new Date(session.closedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
              </p>
            </div>
            <div className="bg-primary-light/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <FileText size={14} />
                <span className="text-xs">Orders</span>
              </div>
              <p className="text-sm font-medium text-theme">{session.orderIds.length}</p>
            </div>
            <div className="bg-primary-light/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <DollarSign size={14} />
                <span className="text-xs">Total</span>
              </div>
              <p className="text-sm font-medium text-theme">₹{session.total}</p>
            </div>
          </div>

          {/* Orders in Session */}
          <div className="space-y-3">
            <h3 className="font-medium text-theme flex items-center gap-2">
              <Users size={16} /> Orders
            </h3>
            <div className="space-y-2">
              {sessionOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-primary-light/10 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-theme">{order.orderNumber}</p>
                    <p className="text-xs text-secondary">
                      {order.source === "manual" ? "Manual Order" : order.customer?.mobile || "Customer"}
                    </p>
                  </div>
                  <p className="font-medium text-theme">₹{order.total}</p>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-theme">
                <span className="font-medium text-theme">Session Total</span>
                <span className="font-bold text-theme">₹{session.total}</span>
              </div>
            </div>
          </div>

          {/* Consolidated Bill */}
          <div className="space-y-3">
            <h3 className="font-medium text-theme flex items-center gap-2">
              <DollarSign size={16} /> Bill Summary
            </h3>
            <div className="border border-theme rounded-lg overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.values(consolidatedItems).map((item, idx) => (
                      <tr key={idx} className="border-b border-theme last:border-0">
                        <td className="px-3 py-2 text-theme">{item.name}</td>
                        <td className="px-3 py-2 text-center text-secondary">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-theme">₹{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-3 py-2 bg-primary-light/20 border-t border-theme">
                <div className="flex justify-between font-medium">
                  <span className="text-theme">Total</span>
                  <span className="text-theme">₹{session.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-theme">
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-theme text-theme rounded-lg font-medium hover:bg-primary-light/20 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}