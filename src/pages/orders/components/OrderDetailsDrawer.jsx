import { Ban, FileText, QrCode, User, X } from "lucide-react";
import { useOrdersStore } from "../../../store/ordersStore";
import StatusChip from "./StatusChip";
import { TINT_SOFT, btn, getReasonLabel } from "../constants";
import {
  canCancelOrder,
  formatCurrency,
  formatTime,
  getActiveQty,
  getCancelledAmount,
  getSessionOrders,
  getSessionTotal,
  isItemCancelled,
} from "../utils/orderUtils";

export default function OrderDetailsDrawer({ orderId, onClose, onCancel }) {
  const orders = useOrdersStore((state) => state.orders);
  const sessions = useOrdersStore((state) => state.sessions);
  const completedSessions = useOrdersStore((state) => state.completedSessions);
  const getTableName = useOrdersStore((state) => state.getTableName);

  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;

  const session =
    sessions.find((s) => s.id === order.sessionId) ||
    completedSessions.find((s) => s.id === order.sessionId);
  const sessionOrders = session ? getSessionOrders(session, orders) : [];
  const isPaid = session?.status === "completed" && session.paymentStatus !== "pending";
  const cancelledAmount = getCancelledAmount(order);
  const cancellations = order.cancellations || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-md h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
          <h2 className="text-lg font-semibold text-theme">{order.orderNumber}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded text-theme opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Order Info */}
          <div className="space-y-3">
            <h3 className="font-medium text-theme">Order Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm items-center">
              <span className="text-secondary">Table</span>
              <span className="text-theme font-medium">{getTableName(order.tableId)}</span>
              <span className="text-secondary">Order Time</span>
              <span className="text-theme">{formatTime(order.createdAt)}</span>
              <span className="text-secondary">Order Source</span>
              <span className="text-theme">{order.source === "qr" ? "QR Menu" : "Manual Order"}</span>
              <span className="text-secondary">Status</span>
              <span>
                <StatusChip status={order.status} />
              </span>
            </div>
          </div>

          {/* Customer */}
          <div className="space-y-2">
            <h3 className="font-medium text-theme flex items-center gap-2">
              <User size={16} /> Customer
            </h3>
            <p className="text-sm text-secondary">{order.customer?.mobile || "Contact number not provided"}</p>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <h3 className="font-medium text-theme flex items-center gap-2">
              <FileText size={16} /> Items
            </h3>
            <div className="space-y-2">
              {order.items.map((item) => {
                const cancelled = isItemCancelled(item);
                const quantity = cancelled ? item.quantity : getActiveQty(item);
                return (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                    <div className={cancelled ? "text-secondary line-through" : "text-theme"}>
                      {item.name} <span className="text-secondary">× {quantity}</span>
                      {!cancelled && item.cancelledQty > 0 && (
                        <span className="ml-1.5 text-xs text-red-600">
                          ({item.cancelledQty} cancelled)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusChip status={item.status} />
                      <span className={`w-16 text-right ${cancelled ? "text-secondary line-through" : "text-theme"}`}>
                        {formatCurrency(item.price * quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="border-t border-theme pt-2 space-y-1">
                {cancelledAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Cancelled / removed</span>
                    <span className="text-red-600">−{formatCurrency(cancelledAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span className="text-theme">Total</span>
                  <span className="text-theme">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation history */}
          {cancellations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-theme flex items-center gap-2">
                <Ban size={16} /> Cancellations
              </h3>
              <div className="space-y-2">
                {cancellations.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-theme p-3 space-y-1.5 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">
                        {entry.type === "full" ? "Full cancellation" : "Partial cancellation"}
                      </span>
                      <span className="text-xs text-secondary">
                        {new Date(entry.at).toLocaleDateString([], { day: "numeric", month: "short" })},{" "}
                        {formatTime(entry.at)}
                      </span>
                    </div>
                    <p className="text-theme">
                      {entry.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                      <span className="text-secondary"> · −{formatCurrency(entry.amount)}</span>
                    </p>
                    <p className="text-secondary">
                      <span className="font-medium">Reason:</span> {getReasonLabel(entry.reason)}
                    </p>
                    {entry.comment && (
                      <p className="text-secondary">
                        <span className="font-medium">Comment:</span> {entry.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Table Session */}
          {session && (
            <div className="space-y-3">
              <h3 className="font-medium text-theme flex items-center gap-2">
                <QrCode size={16} /> Table Session
              </h3>
              <div className={`rounded-lg p-3 space-y-2 ${TINT_SOFT}`}>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Session</span>
                  <span className="text-theme">{session.sessionNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Orders</span>
                  <span className="text-theme">{sessionOrders.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Session Total</span>
                  <span className="text-theme font-medium">{formatCurrency(getSessionTotal(sessionOrders))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Payment</span>
                  <span className="text-theme">{isPaid ? "Paid" : "Payment Pending"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-theme flex flex-col gap-2">
          {canCancelOrder(order) && (
            <button onClick={() => onCancel(order.id)} className={`${btn("outlineDanger", "lg")} w-full`}>
              <Ban size={16} /> Cancel Order / Items
            </button>
          )}
          <button onClick={onClose} className={`${btn("outline", "lg")} w-full`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
