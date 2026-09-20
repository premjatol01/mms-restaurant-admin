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
  getSessionOrders,
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
  const total = getSessionTotal(sessionOrders);
  const cancelledAmount = sessionOrders.reduce((sum, order) => sum + getCancelledAmount(order), 0);
  const hasBill = total > 0;

  const handleConfirm = () => {
    const result = markSessionPaid(sessionId);
    if (!result.ok) {
      toast.error(
        result.reason === "unresolved"
          ? "Some items are still Pending or Under Process."
          : "This session is no longer active."
      );
      return;
    }
    toast.success(
      hasBill
        ? `Payment of ${formatCurrency(result.total)} recorded for ${tableName}.`
        : `Session closed for ${tableName}.`
    );
    onClose();
  };

  const handleServeAll = () => {
    serveAllInSession(sessionId);
    toast.success("All remaining items marked as Served.");
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
            className="rounded-lg border border-amber-400/60 bg-amber-500/10 p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <TriangleAlert size={20} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-theme">
                  {unresolved.length} {unresolved.length === 1 ? "item is" : "items are"} not served yet
                </p>
                <p className="text-sm text-secondary">
                  Update their status, or remove anything that can't be served, before confirming
                  payment.
                </p>
              </div>
            </div>

            <ul className="divide-y divide-[color:var(--color-border)]">
              {unresolved.map(({ order, item }) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <p className="text-sm text-theme">
                      {item.name} <span className="text-secondary">× {getActiveQty(item)}</span>
                    </p>
                    <p className="text-xs text-secondary">Order {order.orderNumber}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
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
                      className={ICON_BTN}
                      title="Remove item"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <button onClick={handleServeAll} className={btn("outline")}>
              <CheckCheck size={16} /> Mark all as Served
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-lg border border-green-400/60 bg-green-500/10 p-3">
            <CircleCheck size={20} className="mt-0.5 shrink-0 text-green-600" />
            <p className="text-sm text-theme">
              {hasBill
                ? "Everything on this bill is served or removed. It's ready for payment."
                : "Every order in this session was cancelled, so there is nothing to collect."}
            </p>
          </div>
        )}

        {/* Bill */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-theme">Bill</h3>
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
                  <span className={order.status === "cancelled" ? "text-secondary" : "text-theme"}>
                    {formatCurrency(order.total)}
                  </span>
                </div>
              ))}
            </div>
            <div className={`px-3 py-2.5 border-t border-theme ${TINT_SOFT}`}>
              {cancelledAmount > 0 && (
                <div className="flex justify-between text-xs text-secondary mb-1">
                  <span>Cancelled / removed</span>
                  <span>−{formatCurrency(cancelledAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-theme">
                <span>Total to collect</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          {hasBill && unresolved.length === 0 && (
            <p className="text-xs text-secondary">
              Confirm that the bill has been collected. This closes the table session.
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
