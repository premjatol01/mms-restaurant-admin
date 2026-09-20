import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useOrdersStore } from "../../../store/ordersStore";
import Select from "../../../components/ui/Select";
import ModalShell from "./ModalShell";
import { CANCEL_REASONS, FIELD, TINT, TINT_SOFT, btn } from "../constants";
import {
  canCancelOrder,
  formatCurrency,
  getActiveQty,
  isItemCancellable,
  isItemCancelled,
} from "../utils/orderUtils";

// Cancel a whole order, or only some items / quantities, with a reason.
// Served items can't be cancelled, so a full cancellation is only offered
// while nothing on the order has been served.
export default function CancelOrderModal({ orderId, onClose }) {
  const order = useOrdersStore((state) => state.orders.find((o) => o.id === orderId));
  if (!order || !canCancelOrder(order)) return null;
  return <CancelForm order={order} onClose={onClose} />;
}

function CancelForm({ order, onClose }) {
  const getTableName = useOrdersStore((state) => state.getTableName);
  const cancelOrderItems = useOrdersStore((state) => state.cancelOrderItems);

  const cancellable = order.items.filter(isItemCancellable);
  const served = order.items.filter((item) => !isItemCancelled(item) && item.status === "served");
  const canFull = served.length === 0;

  const [mode, setMode] = useState(canFull ? "full" : "partial");
  const [quantities, setQuantities] = useState({});
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");

  const selections =
    mode === "full"
      ? cancellable.map((item) => ({ itemId: item.id, quantity: getActiveQty(item) }))
      : cancellable
          .map((item) => ({ itemId: item.id, quantity: quantities[item.id] || 0 }))
          .filter((s) => s.quantity > 0);

  const cancelAmount = selections.reduce((sum, s) => {
    const item = order.items.find((i) => i.id === s.itemId);
    return sum + item.price * s.quantity;
  }, 0);
  const remainingTotal = Math.max(0, order.total - cancelAmount);

  const needsComment = reason === "other";
  const isValid =
    selections.length > 0 && reason !== "" && (!needsComment || comment.trim().length > 0);

  const changeQuantity = (item, delta) => {
    setQuantities((prev) => {
      const next = Math.min(getActiveQty(item), Math.max(0, (prev[item.id] || 0) + delta));
      return { ...prev, [item.id]: next };
    });
  };

  const handleSubmit = () => {
    if (!isValid) return;
    cancelOrderItems(order.id, selections, { reason, comment });
    toast.success(
      mode === "full"
        ? `Order ${order.orderNumber} cancelled.`
        : `Cancelled ${selections.reduce((n, s) => n + s.quantity, 0)} item(s) from ${order.orderNumber}.`
    );
    onClose();
  };

  const modes = [
    { id: "full", title: "Full cancellation", description: "Cancel the entire order.", disabled: !canFull },
    { id: "partial", title: "Partial cancellation", description: "Choose items and quantities.", disabled: false },
  ];

  return (
    <ModalShell
      title={`Cancel Order ${order.orderNumber}`}
      subtitle={getTableName(order.tableId)}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className={btn("outline", "lg")}>
            Keep Order
          </button>
          <button onClick={handleSubmit} disabled={!isValid} className={btn("danger", "lg")}>
            {mode === "full" ? "Cancel Order" : "Cancel Selected Items"}
          </button>
        </>
      }
    >
      {/* Mode */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modes.map((m) => {
            const selected = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                disabled={m.disabled}
                onClick={() => setMode(m.id)}
                className={`text-left rounded-lg p-3 border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  selected ? `border-[color:var(--color-primary)] ${TINT}` : "border-theme"
                }`}
              >
                <p className="text-sm font-medium text-theme">{m.title}</p>
                <p className="text-xs text-secondary">{m.description}</p>
              </button>
            );
          })}
        </div>
        {!canFull && (
          <p className="text-xs text-secondary">
            Some items are already served, so only partial cancellation is available.
          </p>
        )}
      </div>

      {/* Items */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-theme">
          {mode === "full" ? "Items that will be cancelled" : "Select what to cancel"}
        </h3>
        <div className="border border-theme rounded-lg divide-y divide-[color:var(--color-border)]">
          {cancellable.map((item) => {
            const max = getActiveQty(item);
            const value = quantities[item.id] || 0;
            return (
              <div key={item.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm text-theme">
                    {item.name} <span className="text-secondary">× {max}</span>
                  </p>
                  <p className="text-xs text-secondary">{formatCurrency(item.price)} each</p>
                </div>

                {mode === "full" ? (
                  <span className="text-sm text-theme">{formatCurrency(item.price * max)}</span>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => changeQuantity(item, -1)}
                      disabled={value === 0}
                      aria-label={`Decrease ${item.name}`}
                      className="w-7 h-7 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center justify-center disabled:opacity-40"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm text-theme">
                      {value}/{max}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(item, 1)}
                      disabled={value >= max}
                      aria-label={`Increase ${item.name}`}
                      className="w-7 h-7 rounded-full bg-primary text-white hover:opacity-90 flex items-center justify-center disabled:opacity-40"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {served.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 px-3 py-2.5 opacity-60">
              <p className="text-sm text-theme">
                {item.name} <span className="text-secondary">× {getActiveQty(item)}</span>
              </p>
              <span className="text-xs text-secondary">Served – can't be cancelled</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reason */}
      <Select
        label="Reason for cancellation"
        value={reason}
        onChange={setReason}
        options={[{ value: "", label: "Select a reason" }, ...CANCEL_REASONS]}
      />

      <div>
        <label htmlFor="cancel-comment" className="block text-sm font-medium text-theme mb-1">
          Comment{" "}
          <span className="font-normal text-secondary">{needsComment ? "(required)" : "(optional)"}</span>
        </label>
        <textarea
          id="cancel-comment"
          rows={3}
          maxLength={300}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a note for your records"
          className={FIELD}
        />
      </div>

      {/* Summary */}
      <div className={`rounded-lg p-3 space-y-1 text-sm ${TINT_SOFT}`}>
        <div className="flex justify-between">
          <span className="text-secondary">Amount being cancelled</span>
          <span className="font-medium text-red-600">−{formatCurrency(cancelAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">Order total after cancellation</span>
          <span className="font-medium text-theme">{formatCurrency(remainingTotal)}</span>
        </div>
      </div>
    </ModalShell>
  );
}
