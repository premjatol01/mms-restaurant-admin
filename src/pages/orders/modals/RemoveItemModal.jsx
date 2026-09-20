import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useOrdersStore } from "../../../store/ordersStore";
import Select from "../../../components/ui/Select";
import ModalShell from "./ModalShell";
import { CANCEL_REASONS, FIELD, TINT_SOFT, btn } from "../constants";
import { formatCurrency, getActiveQty, isItemCancellable } from "../utils/orderUtils";

// Removes an item the kitchen can't serve. It's recorded as a (partial)
// cancellation on the order, so the reason shows up in order history and in
// the Excel export, and the bill total drops automatically.
export default function RemoveItemModal({ orderId, itemId, onClose }) {
  const order = useOrdersStore((state) => state.orders.find((o) => o.id === orderId));
  const item = order?.items.find((i) => i.id === itemId);
  if (!order || !item || !isItemCancellable(item)) return null;
  return <RemoveForm order={order} item={item} onClose={onClose} />;
}

function RemoveForm({ order, item, onClose }) {
  const removeItem = useOrdersStore((state) => state.removeItem);
  const [reason, setReason] = useState("item_unavailable");
  const [comment, setComment] = useState("");

  const quantity = getActiveQty(item);
  const needsComment = reason === "other";
  const isValid = reason !== "" && (!needsComment || comment.trim().length > 0);

  const handleRemove = () => {
    if (!isValid) return;
    removeItem(order.id, item.id, { reason, comment });
    toast.success(`${item.name} removed from ${order.orderNumber}.`);
    onClose();
  };

  return (
    <ModalShell
      title="Remove item"
      subtitle={`From order ${order.orderNumber}`}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className={btn("outline", "lg")}>
            Keep Item
          </button>
          <button onClick={handleRemove} disabled={!isValid} className={btn("danger", "lg")}>
            Remove Item
          </button>
        </>
      }
    >
      <div className={`flex items-start gap-3 rounded-lg p-3 ${TINT_SOFT}`}>
        <TriangleAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="text-sm">
          <p className="font-medium text-theme">
            {item.name} <span className="text-secondary">× {quantity}</span>
          </p>
          <p className="text-secondary">
            {formatCurrency(item.price * quantity)} will be taken off the bill. This can't be undone.
          </p>
        </div>
      </div>

      <Select
        label="Reason"
        value={reason}
        onChange={setReason}
        options={CANCEL_REASONS}
      />

      <div>
        <label htmlFor="remove-comment" className="block text-sm font-medium text-theme mb-1">
          Comment{" "}
          <span className="font-normal text-secondary">{needsComment ? "(required)" : "(optional)"}</span>
        </label>
        <textarea
          id="remove-comment"
          rows={3}
          maxLength={300}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a note for your records"
          className={FIELD}
        />
      </div>
    </ModalShell>
  );
}
