import { Ban, Eye, IndianRupee, Trash2, TriangleAlert } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { useOrdersStore } from "../../../store/ordersStore";
import StatusChip from "./StatusChip";
import { ICON_BTN, ITEM_STATUS_OPTIONS, SELECT_SM, TINT_SOFT, btn } from "../constants";
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

      <div className="flex items-center justify-end gap-1 w-[10.5rem]">
        {cancelled ? (
          <StatusChip status="cancelled" />
        ) : (
          <>
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

function OrderBlock({ order, onViewOrder, onCancelOrder, onRemoveItem }) {
  return (
    <div
      className={`rounded-lg border border-theme overflow-hidden ${
        order.status === "cancelled" ? "opacity-70" : ""
      }`}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-theme ${TINT_SOFT}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-theme">{order.orderNumber}</span>
          <span className="text-xs text-secondary">{formatTime(order.createdAt)}</span>
          {order.source === "manual" && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Manual</span>
          )}
          <StatusChip status={order.status} />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-theme mr-1">{formatCurrency(order.total)}</span>
          <button
            onClick={() => onViewOrder(order.id)}
            className={ICON_BTN}
            title="View order details"
            aria-label={`View ${order.orderNumber}`}
          >
            <Eye size={16} />
          </button>
          {canCancelOrder(order) && (
            <button
              onClick={() => onCancelOrder(order.id)}
              className={ICON_BTN}
              title="Cancel order or items"
              aria-label={`Cancel ${order.orderNumber}`}
            >
              <Ban size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-[color:var(--color-border)]">
        {order.items.map((item) => (
          <ItemRow key={item.id} order={order} item={item} onRemoveItem={onRemoveItem} />
        ))}
      </div>
    </div>
  );
}

// One open table session: every order, item, price and status in one place.
export default function SessionCard({ session, orders, onMarkPaid, onRemoveItem, onViewOrder, onCancelOrder }) {
  const getTableName = useOrdersStore((state) => state.getTableName);

  const total = getSessionTotal(orders);
  const cancelledAmount = orders.reduce((sum, order) => sum + getCancelledAmount(order), 0);
  const unresolved = getUnresolvedItems(orders);
  const pendingCount = unresolved.filter(({ item }) => item.status === "pending").length;
  const processingCount = unresolved.length - pendingCount;

  const unresolvedSummary = [
    pendingCount > 0 && `${pendingCount} pending`,
    processingCount > 0 && `${processingCount} under process`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="rounded-xl border border-theme bg-surface p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-theme">{getTableName(session.tableId)}</h3>
          <p className="text-sm text-secondary">
            {session.sessionNumber} · Started {formatTime(session.startedAt)} (
            {formatDistanceToNowStrict(new Date(session.startedAt), { addSuffix: true })})
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap bg-yellow-100 text-yellow-700">
          Payment Pending
        </span>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <OrderBlock
            key={order.id}
            order={order}
            onViewOrder={onViewOrder}
            onCancelOrder={onCancelOrder}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-theme pt-3">
        <div>
          <p className="text-xs text-secondary">Session total</p>
          <p className="text-xl font-bold text-theme">{formatCurrency(total)}</p>
          {cancelledAmount > 0 && (
            <p className="text-xs text-red-600">−{formatCurrency(cancelledAmount)} cancelled / removed</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {unresolved.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-amber-600">
              <TriangleAlert size={14} /> {unresolvedSummary}
            </p>
          )}
          <button onClick={() => onMarkPaid(session.id)} className={btn("success", "lg")}>
            <IndianRupee size={16} /> {total > 0 ? "Mark as Paid" : "Close Session"}
          </button>
        </div>
      </div>
    </article>
  );
}
