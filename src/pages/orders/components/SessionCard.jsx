import { useState } from "react";
import { Ban, CheckCircle, Eye, IndianRupee, Trash2, TriangleAlert, QrCode } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { toast } from "sonner";
import { useOrdersStore } from "../../../store/ordersStore";
import StatusChip from "./StatusChip";
import Select from "../../../components/ui/Select";
import EndSessionModal from "../modals/EndSessionModal";
import { ICON_BTN, ITEM_STATUS_OPTIONS, btn, getReasonLabel } from "../constants";
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
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 text-xs sm:text-sm">
      <div className="flex-1 min-w-[7rem]">
        <span className={cancelled ? "text-secondary line-through" : "text-theme"}>{item.name}</span>{" "}
        <span className="text-secondary font-medium">× {quantity}</span>
        {!cancelled && item.cancelledQty > 0 && (
          <span className="ml-1.5 text-[11px] text-red-600 font-medium">({item.cancelledQty} cancelled)</span>
        )}
      </div>

      <span className={`w-14 text-right text-xs sm:text-sm ${cancelled ? "text-secondary line-through" : "text-theme font-semibold"}`}>
        {formatCurrency(item.price * quantity)}
      </span>

      <div className="flex items-center justify-end gap-1 w-[10rem]">
        {cancelled ? (
          <StatusChip status="cancelled" />
        ) : (
          <>
            <Select
              aria-label={`Status of ${item.name}`}
              value={item.status}
              onChange={(val) => updateItemStatus(order.id, item.id, val)}
              options={ITEM_STATUS_OPTIONS}
              className="w-28 text-xs"
              isSearchable={false}
            />
            <span className="w-7 flex justify-center">
              {item.status !== "served" && (
                <button
                  onClick={() => onRemoveItem({ orderId: order.id, itemId: item.id })}
                  className={ICON_BTN}
                  title="Remove item (can't be served)"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 size={14} />
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
  const [showEndModal, setShowEndModal] = useState(false);

  const rawSubtotal = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const sessionSubtotal = session.subtotal ?? rawSubtotal;
  const sessionGst = session.gst ?? 0;
  const sessionDiscount = session.discount ?? 0;
  const total = session.total ?? getSessionTotal(orders, session);
  const unresolved = getUnresolvedItems(orders).length;
  const tableCancelledTotal = orders.reduce((sum, order) => sum + getCancelledAmount(order), 0);

  const hasOrders = orders.length > 0;
  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const isZeroOrCancelled = !hasOrders || activeOrders.length === 0 || total === 0;

  const handleMarkPaid = () => {
    if (unresolved > 0) {
      toast.warning("Table still has unserved items.");
    }
    onMarkPaid(session.id);
  };

  return (
    <>
      <article className="rounded-2xl border border-black/10 dark:border-white/10 bg-surface shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden">
        {/* Session Header - Soft, modern & airy */}
        <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50/80 dark:bg-slate-900/40 border-b border-black/5 dark:border-white/5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-theme">{getTableName(session.tableId)}</h4>
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                #{session.sessionNumber}
              </span>
            </div>
            <p className="text-xs text-secondary">
              Started {formatTime(session.startedAt)} · {formatDistanceToNowStrict(new Date(session.startedAt))} ago
              {session.customerMobile && <span className="ml-2 font-medium">· 📱 {session.customerMobile}</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unresolved > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <TriangleAlert size={12} /> {unresolved} unserved
              </span>
            ) : hasOrders && activeOrders.length > 0 ? (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                All served
              </span>
            ) : null}
            <div className="text-right">
              <span className="text-base font-black text-theme">{formatCurrency(total)}</span>
              {sessionGst > 0 && (
                <span className="block text-[10px] text-secondary">
                  (incl. {formatCurrency(sessionGst)} GST)
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Orders in this Table - Clean, separated light cards */}
        <div className="p-3.5 space-y-3 flex-1 bg-surface">
          {!hasOrders ? (
            <div className="rounded-xl border border-dashed border-black/10 dark:border-white/10 p-5 text-center text-xs text-secondary">
              <p className="font-medium text-theme">No orders placed yet</p>
              <p className="text-[11px] mt-0.5">Table is active and awaiting orders.</p>
            </div>
          ) : (
            orders.map((order) => {
              const isOrderCancelled = order.status === "cancelled";
              const cancellable = canCancelOrder(order);
              const cancelReason = order.cancelReason || order.cancellations?.[0]?.reason;
              const cancelComment = order.cancelComment || order.cancellations?.[0]?.comment;

              return (
                <div
                  key={order.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isOrderCancelled
                      ? "border-red-300/30 bg-red-50/40 dark:bg-red-950/20"
                      : "border-black/5 dark:border-white/5 bg-slate-50/60 dark:bg-slate-900/30 hover:border-black/10 dark:hover:border-white/10"
                  }`}
                >
                  {/* Order Top Line */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-100/40 dark:bg-slate-800/30 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-theme">{order.orderNumber}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface border border-black/5 dark:border-white/5 text-secondary capitalize">
                        {order.source === "manual" ? "Manual" : <><QrCode size={10} /> QR</>}
                      </span>
                      <span className="text-xs text-secondary">
                        · {formatTime(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <StatusChip status={order.status} />
                      <button
                        onClick={() => onViewOrder?.(order.id || order)}
                        className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer ml-1"
                        title="View order details"
                      >
                        <Eye size={13} /> View
                      </button>
                      {cancellable && (
                        <button
                          onClick={() => onCancelOrder?.(order.id || order)}
                          className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 ml-1 cursor-pointer"
                          title="Cancel order"
                        >
                          <Ban size={13} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cancel Reason (if applicable) */}
                  {(cancelReason || isOrderCancelled) && (
                    <div className="px-3 py-1 text-[11px] bg-red-100/70 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-b border-red-200/50 flex items-center justify-between">
                      <span>
                        <span className="font-bold">Cancelled:</span> {getReasonLabel(cancelReason || "other")}
                      </span>
                      {cancelComment && (
                        <span className="opacity-80 italic truncate max-w-[180px]">
                          "{cancelComment}"
                        </span>
                      )}
                    </div>
                  )}

                  {/* Item Rows */}
                  <div className="divide-y divide-black/5 dark:divide-white/5">
                    {order.items.map((item) => (
                      <ItemRow key={item.id} order={order} item={item} onRemoveItem={onRemoveItem} />
                    ))}
                  </div>

                  {/* Order Subtotal Row */}
                  <div className="px-3 py-1.5 bg-slate-100/20 dark:bg-slate-800/20 flex justify-between items-center text-xs">
                    <span className="text-secondary font-medium">Order Subtotal</span>
                    <span className={`font-bold ${isOrderCancelled ? "text-secondary line-through" : "text-theme"}`}>
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 dark:border-white/5 px-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/40">
          <div className="text-xs space-y-0.5">
            <div className="text-secondary flex items-center gap-2">
              <span>{activeOrders.length} {activeOrders.length === 1 ? "active order" : "active orders"}</span>
              {tableCancelledTotal > 0 && (
                <span className="text-red-600 font-medium line-through">
                  ({formatCurrency(tableCancelledTotal)} cancelled)
                </span>
              )}
            </div>
            {sessionGst > 0 && (
              <div className="text-[11px] text-secondary">
                Subtotal: {formatCurrency(sessionSubtotal)} · GST: {formatCurrency(sessionGst)}
                {sessionDiscount > 0 && <span> · Discount: -{formatCurrency(sessionDiscount)}</span>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isZeroOrCancelled ? (
              <button
                onClick={() => setShowEndModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="End session directly (table is free)"
              >
                <CheckCircle size={14} /> End Session
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowEndModal(true)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-secondary hover:text-red-600 transition-colors cursor-pointer"
                  title="End session directly"
                >
                  End Session
                </button>
                <button
                  onClick={handleMarkPaid}
                  className={`${btn("primary")} inline-flex items-center gap-1.5 cursor-pointer text-xs`}
                  title={unresolved > 0 ? "Table has unserved items" : "Close session and mark as paid"}
                >
                  <IndianRupee size={14} /> Mark as Paid
                </button>
              </>
            )}
          </div>
        </footer>
      </article>

      {/* Confirmation Modal for Ending Session */}
      {showEndModal && (
        <EndSessionModal
          session={session}
          isOpen={showEndModal}
          onClose={() => setShowEndModal(false)}
        />
      )}
    </>
  );
}
