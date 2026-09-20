import { Ban, CheckCheck, ChefHat, Eye, QrCode, Utensils } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { toast } from "sonner";
import { useOrdersStore } from "../../../store/ordersStore";
import StatusChip from "./StatusChip";
import { btn } from "../constants";
import {
  canCancelOrder,
  formatCurrency,
  formatTime,
  getActiveQty,
  isItemCancelled,
} from "../utils/orderUtils";

// One order in the Pending / Under Process board.
// The primary button moves the whole order forward:
//   Pending -> Under Process -> Served (served orders leave this board and stay
//   visible under their table session).
export default function OrderCard({ order, onView, onCancel }) {
  const updateOrderStatus = useOrdersStore((state) => state.updateOrderStatus);
  const getTableName = useOrdersStore((state) => state.getTableName);

  const isPending = order.status === "pending";
  const liveStatuses = new Set(
    order.items.filter((item) => !isItemCancelled(item)).map((item) => item.status)
  );
  // Only show per-item chips when items are at different stages.
  const showItemStatus = liveStatuses.size > 1;

  const handleAdvance = () => {
    if (isPending) {
      updateOrderStatus(order.id, "processing");
      toast.success(`${order.orderNumber} moved to Under Process.`);
    } else {
      updateOrderStatus(order.id, "served");
      toast.success(`${order.orderNumber} marked as Served.`);
    }
  };

  return (
    <article className="rounded-xl border border-theme bg-surface p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-theme">{order.orderNumber}</span>
            {order.source === "manual" ? (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Manual</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                <QrCode size={12} /> QR
              </span>
            )}
          </div>
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-secondary">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Utensils size={14} /> {getTableName(order.tableId)}
            </span>
            {order.customer?.mobile && <span>{order.customer.mobile}</span>}
          </p>
        </div>

        <div className="text-right space-y-1 shrink-0">
          <StatusChip status={order.status} />
          <p className="text-xs text-secondary" title={new Date(order.createdAt).toLocaleString()}>
            {formatTime(order.createdAt)} ·{" "}
            {formatDistanceToNowStrict(new Date(order.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      <ul className="space-y-1.5">
        {order.items.map((item) => {
          const cancelled = isItemCancelled(item);
          const quantity = getActiveQty(item);
          return (
            <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <span className={cancelled ? "text-secondary line-through" : "text-theme"}>
                {item.name}{" "}
                <span className="text-secondary">× {cancelled ? item.quantity : quantity}</span>
                {!cancelled && item.cancelledQty > 0 && (
                  <span className="ml-1.5 text-xs text-red-600">({item.cancelledQty} cancelled)</span>
                )}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                {cancelled ? (
                  <StatusChip status="cancelled" />
                ) : (
                  <>
                    {showItemStatus && <StatusChip status={item.status} />}
                    <span className="text-theme">{formatCurrency(item.price * quantity)}</span>
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-theme pt-3">
        <p className="text-sm text-secondary">
          Total <span className="font-semibold text-theme">{formatCurrency(order.total)}</span>
        </p>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button onClick={() => onView(order.id)} className={btn("outline")}>
            <Eye size={15} /> Details
          </button>
          {canCancelOrder(order) && (
            <button onClick={() => onCancel(order.id)} className={btn("outlineDanger")}>
              <Ban size={15} /> Cancel
            </button>
          )}
          <button onClick={handleAdvance} className={btn("primary")}>
            {isPending ? (
              <>
                <ChefHat size={15} /> Start Preparing
              </>
            ) : (
              <>
                <CheckCheck size={15} /> Mark Served
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
