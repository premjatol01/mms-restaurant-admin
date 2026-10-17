import { useState } from "react";
import { CheckCheck, CircleCheck, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useOrdersStore } from "../../../store/ordersStore";
import ModalShell from "./ModalShell";
import RemoveItemModal from "./RemoveItemModal";
import { ICON_BTN, ITEM_STATUS_OPTIONS, SELECT_SM, TINT_SOFT, btn } from "../constants";
import {
  formatCurrency,
  getActiveQty,
  getCancelledAmount,
  getSessionDiscount,
  getSessionGst,
  getSessionOrders,
  getSessionSubtotal,
  getSessionTotal,
  getUnresolvedItems,
} from "../utils/orderUtils";

// Confirmation step before a bill is marked as paid.
// If any item is still Pending / Under Process, an alert lists them and the
// admin can update their status or remove them; payment can only be confirmed
// once nothing is outstanding.
export default function MarkPaidModal({ sessionId, onClose }) {
  const session = useOrdersStore((state) => state.sessions.find((s) => s.id === sessionId));
  const orders = useOrdersStore((state) => state.orders);
  const getTableName = useOrdersStore((state) => state.getTableName);
  const updateItemStatus = useOrdersStore((state) => state.updateItemStatus);
  const serveAllInSession = useOrdersStore((state) => state.serveAllInSession);
  const markSessionPaid = useOrdersStore((state) => state.markSessionPaid);
  const [removeTarget, setRemoveTarget] = useState(null);

  if (!session) return null;

  const tableName = getTableName(session.tableId);
  const sessionOrders = getSessionOrders(session, orders);
  const unresolved = getUnresolvedItems(sessionOrders);

  const subtotal = session.subtotal ?? getSessionSubtotal(sessionOrders);
  const discount = session.discount ?? getSessionDiscount(sessionOrders);
  const gst = session.gst ?? getSessionGst(sessionOrders, session);
  const total = session.total ?? Math.max(0, subtotal + gst - discount);

  const cancelledAmount = sessionOrders.reduce((sum, order) => sum + getCancelledAmount(order), 0);
  const hasBill = total > 0;

  const handleConfirm = async () => {
    const result = await markSessionPaid(sessionId);
    if (!result.ok) {
      toast.error(
        result.reason === "unresolved"
          ? "Some items have not been verified as delivered yet. Please update their delivery status before payment."
          : (result.message || "This session is no longer active.")
      );
      return;
    }
    toast.success(
      hasBill
        ? `Payment of ${formatCurrency(result.total)} recorded for ${tableName}. Table is now free.`
        : `Session closed for ${tableName}. Table is now free.`
    );
    onClose();
  };

  const handleServeAll = async () => {
    await serveAllInSession(sessionId);
    toast.success("All remaining items confirmed as Delivered to table.");
  };

  return (
    <>
      <ModalShell
        title={hasBill ? "Mark as Paid" : "Close Session"}
        subtitle={`${tableName} · ${session.sessionNumber}`}
        onClose={onClose}
        size="lg"
        footer={
          <>
            <button onClick={onClose} className={btn("outline", "lg")}>
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={unresolved.length > 0}
              className={btn("success", "lg")}
              title={unresolved.length > 0 ? "Verify all items are delivered before collecting payment" : ""}
            >
              <CircleCheck size={16} />
              {hasBill ? "Confirm Payment" : "Close Session"}
            </button>
          </>
        }
      >
        {unresolved.length > 0 ? (
          <div
            role="alert"
            className="rounded-lg border border-amber-400/70 bg-amber-500/10 p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <TriangleAlert size={20} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-theme">
                  Delivery Verification Required ({unresolved.length} {unresolved.length === 1 ? "item" : "items"} not delivered yet)
                </p>
                <p className="text-sm text-secondary">
                  Please verify if these items have been sent to {tableName}. Confirm them as delivered, or remove items that were not served before collecting payment.
                </p>
              </div>
            </div>

            <ul className="divide-y divide-[color:var(--color-border)]">
              {unresolved.map(({ order, item }) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2.5 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-theme">
                        {item.name} <span className="text-secondary font-normal">× {getActiveQty(item)}</span>
                      </p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        item.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {item.status === "pending" ? "Pending in Kitchen" : "Cooking / In Kitchen"}
                      </span>
                    </div>
                    <p className="text-xs text-secondary mt-0.5">Order {order.orderNumber}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        updateItemStatus(order.id, item.id, "served");
                        toast.success(`Marked "${item.name}" as Delivered.`);
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1 shadow-xs"
                      title="Confirm this item has been sent/delivered to the table"
                    >
                      <CircleCheck size={13} /> Delivered
                    </button>

                    <select
                      aria-label={`Status of ${item.name}`}
                      value={item.status}
                      onChange={(e) => updateItemStatus(order.id, item.id, e.target.value)}
                      className={SELECT_SM}
                    >
                      {ITEM_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => setRemoveTarget({ orderId: order.id, itemId: item.id })}
                      className="p-1.5 text-red-600 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Not sent (Remove / Cancel item)"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-300/40">
              <span className="text-xs text-amber-700 font-medium">
                Sent all orders to the table?
              </span>
              <button onClick={handleServeAll} className={btn("outline")}>
                <CheckCheck size={16} /> Confirm All as Delivered
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-lg border border-green-400/60 bg-green-500/10 p-3.5">
            <CircleCheck size={20} className="mt-0.5 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-800">
                All Orders Confirmed Delivered
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                {hasBill
                  ? `Every order item on this bill has been delivered to ${tableName} or cancelled. You can now collect payment and free the table.`
                  : "All orders in this session were cancelled. You can now close the session."}
              </p>
            </div>
          </div>
        )}

        {/* Bill */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-theme">Bill Breakdown</h3>
          <div className="border border-theme rounded-lg overflow-hidden">
            <div className="divide-y divide-[color:var(--color-border)]">
              {sessionOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className={order.status === "cancelled" ? "text-secondary line-through" : "text-theme"}>
                    {order.orderNumber}
                    <span className="text-secondary">
                      {" "}
                      · {order.items.filter((i) => getActiveQty(i) > 0).length} item(s)
                    </span>
                  </span>
                  <span className={order.status === "cancelled" ? "text-secondary" : "text-theme font-medium"}>
                    {formatCurrency(order.total)}
                  </span>
                </div>
              ))}
            </div>
            <div className={`px-3 py-2.5 border-t border-theme ${TINT_SOFT} space-y-1.5`}>
              <div className="flex justify-between text-xs text-secondary">
                <span>Items Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-xs text-secondary">
                <span>Taxes (GST 5%)</span>
                <span>{formatCurrency(gst)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-xs text-green-600 font-medium">
                  <span>Offer Discount</span>
                  <span>−{formatCurrency(discount)}</span>
                </div>
              )}

              {cancelledAmount > 0 && (
                <div className="flex justify-between text-xs text-red-500">
                  <span>Cancelled / removed</span>
                  <span>−{formatCurrency(cancelledAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center font-bold text-theme pt-2 border-t border-theme">
                <span className="text-sm">Total to collect</span>
                <span className="text-base text-primary font-extrabold">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          {hasBill && unresolved.length === 0 && (
            <p className="text-xs text-secondary">
              Confirm that the bill of {formatCurrency(total)} has been collected. This closes the table session.
            </p>
          )}
        </div>
      </ModalShell>

      {removeTarget && (
        <RemoveItemModal
          orderId={removeTarget.orderId}
          itemId={removeTarget.itemId}
          onClose={() => setRemoveTarget(null)}
        />
      )}
    </>
  );
}
