import { Ban, Eye, IndianRupee, Trash2, TriangleAlert } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { toast } from "sonner";
import { useOrdersStore } from "../../../store/ordersStore";
import StatusChip from "./StatusChip";
import Select from "../../../components/ui/Select";
import { ICON_BTN, ITEM_STATUS_OPTIONS, TINT_SOFT, btn } from "../constants";
import {
  canCancelOrder,
  formatCurrency,
  formatTime,
  getActiveQty,
  getCancelledAmount,
  getSessionTotal,
  getUnresolvedItems,
  isItemCancelled,
} from "../utils/orderUtils";

function ItemRow({ order, item, onRemoveItem }) {
  const updateItemStatus = useOrdersStore((state) => state.updateItemStatus);
  const cancelled = isItemCancelled(item);
  const quantity = cancelled ? item.quantity : getActiveQty(item);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
      <div className="flex-1 min-w-[8rem]">
        <span className={cancelled ? "text-secondary line-through" : "text-theme"}>{item.name}</span>{" "}
        <span className="text-secondary">× {quantity}</span>
        {!cancelled && item.cancelledQty > 0 && (
          <span className="ml-1.5 text-xs text-red-600">({item.cancelledQty} cancelled)</span>
        )}
      </div>

      <span className={`w-16 text-right ${cancelled ? "text-secondary line-through" : "text-theme"}`}>
        {formatCurrency(item.price * quantity)}
      </span>

      <div className="flex items-center justify-end gap-1 w-[11rem]">
        {cancelled ? (
          <StatusChip status="cancelled" />
        ) : (
          <>
            <Select
              aria-label={`Status of ${item.name}`}
              value={item.status}
              onChange={(val) => updateItemStatus(order.id, item.id, val)}
              options={ITEM_STATUS_OPTIONS}
              className="w-32"
              isSearchable={false}
            />
            <span className="w-8 flex justify-center">
              {item.status !== "served" && (
                <button
                  onClick={() => onRemoveItem({ orderId: order.id, itemId: item.id })}
                  className={ICON_BTN}
                  title="Remove item (can't be served)"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default function SessionCard({ session, orders, onMarkPaid, onRemoveItem, onViewOrder, onCancelOrder }) {
  const getTableName = useOrdersStore((state) => state.getTableName);
  const total = getSessionTotal(orders);
  const unresolved = getUnresolvedItems(orders).length;
  const tableCancelledTotal = orders.reduce((sum, order) => sum + getCancelledAmount(order), 0);

  const handleMarkPaid = () => {
    if (unresolved > 0) {
      toast.warning("Table still has unserved items.");
    }
    onMarkPaid(session.id);
  };

  const hasOrders = orders.length > 0;
  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const canCancelAnyOrder = orders.some(canCancelOrder);

  return (
    <article className="rounded-xl border border-theme bg-surface shadow-xs transition-shadow hover:shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-theme/60 px-4 py-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-theme">{getTableName(session.tableId)}</h4>
            <span className="text-xs text-secondary font-mono">#{session.sessionNumber}</span>
          </div>
          <p className="text-xs text-secondary">
            Started {formatTime(session.startedAt)} · {formatDistanceToNowStrict(new Date(session.startedAt))} ago
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unresolved > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
              <TriangleAlert size={13} /> {unresolved} unserved
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              All served
            </span>
          )}
          <span className="text-base font-bold text-theme">{formatCurrency(total)}</span>
        </div>
      </header>

      <div className="divide-y divide-theme/40">
        {!hasOrders ? (
          <p className="p-4 text-sm text-secondary">No orders placed yet.</p>
        ) : (
          orders.map((order) => {
            const isOrderCancelled = order.status === "cancelled";
            const cancellable = canCancelOrder(order);

            return (
              <div
                key={order.id}
                className={isOrderCancelled ? "bg-red-500/5 opacity-80" : undefined}
              >
                <div className="flex items-center justify-between px-3 py-2 text-xs bg-primary-light/10 text-secondary">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-theme">#{order.orderNumber}</span>
                    <span className="capitalize">{order.source}</span>
                    <span>·</span>
                    <span>{formatTime(order.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusChip status={order.status} />
                    <button
                      onClick={() => onViewOrder(order)}
                      className="text-primary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                      title="View full order details"
                    >
                      <Eye size={13} /> View
                    </button>
                    {cancellable && (
                      <button
                        onClick={() => onCancelOrder(order)}
                        className="text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 ml-1 cursor-pointer"
                        title="Cancel this order"
                      >
                        <Ban size={13} /> Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-theme/20">
                  {order.items.map((item) => (
                    <ItemRow key={item.id} order={order} item={item} onRemoveItem={onRemoveItem} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-theme/60 px-4 py-3 bg-primary-light/5">
        <div className="text-xs text-secondary">
          {activeOrders.length} {activeOrders.length === 1 ? "order" : "orders"}
          {tableCancelledTotal > 0 && (
            <span className="ml-2 text-red-600 line-through">
              ({formatCurrency(tableCancelledTotal)} cancelled)
            </span>
          )}
        </div>

        <button
          onClick={handleMarkPaid}
          className={`${btn("primary")} inline-flex items-center gap-1.5 cursor-pointer`}
          title={unresolved > 0 ? "Table has unserved items" : "Close session and mark as paid"}
        >
          <IndianRupee size={15} /> Mark as Paid
        </button>
      </footer>
    </article>
  );
}