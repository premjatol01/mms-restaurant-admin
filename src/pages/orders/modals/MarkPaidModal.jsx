import { useState } from "react";
import { CheckCheck, CircleCheck, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useOrdersStore } from "../../../store/ordersStore";
import { useProfileStore } from "../../../store/profileStore";
import ModalShell from "./ModalShell";
import RemoveItemModal from "./RemoveItemModal";
import PaymentSlipModal from "./PaymentSlipModal";
import Select from "../../../components/ui/Select";
import { ICON_BTN, ITEM_STATUS_OPTIONS, TINT_SOFT, btn } from "../constants";
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
// admin can update their status, deliver all, or confirm payment directly.
export default function MarkPaidModal({ sessionId, onClose }) {
  const session = useOrdersStore(
    (state) =>
      state.sessions.find(
        (s) =>
          s.id === sessionId ||
          s._id === sessionId ||
          String(s.id) === String(sessionId) ||
          String(s._id) === String(sessionId)
      ) ||
      state.completedSessions.find(
        (s) =>
          s.id === sessionId ||
          s._id === sessionId ||
          String(s.id) === String(sessionId) ||
          String(s._id) === String(sessionId)
      )
  );
  const orders = useOrdersStore((state) => state.orders);
  const getTableName = useOrdersStore((state) => state.getTableName);
  const updateItemStatus = useOrdersStore((state) => state.updateItemStatus);
  const serveAllInSession = useOrdersStore((state) => state.serveAllInSession);
  const markSessionPaid = useOrdersStore((state) => state.markSessionPaid);
  const profile = useProfileStore((state) => state.profile);

  const isGstEnabled = Boolean(profile?.gstSettings?.enabled);
  const gstRate = Number(profile?.gstSettings?.percentage ?? 5);
  const chargeType = profile?.gstSettings?.chargeType || "exclusive";

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [removeTarget, setRemoveTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isServingAll, setIsServingAll] = useState(false);
  const [paidSession, setPaidSession] = useState(null);

  if (paidSession) {
    return (
      <PaymentSlipModal
        session={paidSession}
        isOpen={Boolean(paidSession)}
        onClose={onClose}
      />
    );
  }

  if (!session) return null;

  const sessionOrders = getSessionOrders(session, orders);
  const unresolved = getUnresolvedItems(sessionOrders);
  const subtotal = getSessionSubtotal(sessionOrders);
  const gst = getSessionGst(sessionOrders, session);
  const discount = getSessionDiscount(sessionOrders);
  const total = getSessionTotal(sessionOrders, session);
  const cancelledTotal = sessionOrders.reduce((sum, o) => sum + getCancelledAmount(o), 0);
  const tableName = getTableName(session.tableId);

  const handleServeAll = async () => {
    setIsServingAll(true);
    try {
      await serveAllInSession(session.id);
      toast.success(`Marked all items as Delivered for ${tableName}.`);
    } catch (err) {
      toast.error(err.message || "Failed to update item statuses.");
    } finally {
      setIsServingAll(false);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const res = await markSessionPaid(session.id, paymentMethod, true);
      if (res && !res.ok) {
        toast.error(res.message || "Failed to mark session as paid.");
        return;
      }
      toast.success(`Session for ${tableName} marked as paid (${paymentMethod.toUpperCase()}).`);
      setPaidSession({
        ...session,
        ...(res?.data || {}),
        paymentMethod,
        paymentStatus: "paid",
        paidAt: new Date().toISOString(),
        closedAt: new Date().toISOString(),
      });
    } catch (err) {
      toast.error(err.message || "Failed to mark session as paid.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ModalShell
        title={`Collect Payment — ${tableName}`}
        subtitle={`Session #${session.sessionNumber}`}
        onClose={onClose}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {/* Unresolved items banner */}
          {unresolved.length > 0 ? (
            <div className="rounded-xl border border-amber-300/60 bg-amber-500/10 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <TriangleAlert size={20} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-theme">
                    Delivery Verification ({unresolved.length} {unresolved.length === 1 ? "item" : "items"} not delivered yet)
                  </p>
                  <p className="text-sm text-secondary">
                    Please verify if these items have been sent to {tableName}. You can confirm them as delivered or proceed with payment to auto-deliver all.
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
                        type="button"
                        onClick={async () => {
                          await updateItemStatus(order.id, item.id, "served");
                          toast.success(`Marked "${item.name}" as Delivered.`);
                        }}
                        className="px-2.5 py-1 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Confirm this item has been sent/delivered to the table"
                      >
                        <CircleCheck size={13} /> Delivered
                      </button>

                      <Select
                        aria-label={`Status of ${item.name}`}
                        value={item.status}
                        onChange={(val) => updateItemStatus(order.id, item.id, val)}
                        options={ITEM_STATUS_OPTIONS}
                        className="w-32"
                        isSearchable={false}
                      />

                      <button
                        type="button"
                        onClick={() => setRemoveTarget({ orderId: order.id, itemId: item.id })}
                        className="p-1.5 text-red-600 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
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
                <button
                  type="button"
                  disabled={isServingAll}
                  onClick={handleServeAll}
                  className={`${btn("outline")} cursor-pointer`}
                >
                  <CheckCheck size={14} /> {isServingAll ? "Delivering..." : "Deliver All Items"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
              <CircleCheck size={18} /> All ordered items have been served. You can safely close the bill.
            </div>
          )}

          {/* Bill summary */}
          <section className="rounded-xl border border-theme p-4 space-y-2 text-sm bg-surface">
            <h4 className="font-semibold text-theme mb-2">Bill Summary</h4>
            <div className="flex justify-between text-secondary">
              <span>Subtotal</span>
              <span className="text-theme">{formatCurrency(subtotal)}</span>
            </div>
            {isGstEnabled && gst > 0 ? (
              <div className="flex justify-between text-secondary">
                <span>
                  GST ({gstRate}%)
                  {chargeType === "inclusive" && <span className="text-[11px] text-secondary ml-1">(incl.)</span>}
                </span>
                <span className="text-theme font-medium">{formatCurrency(gst)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-secondary">
                <span>GST ({isGstEnabled ? `${gstRate}%` : "0% - Disabled"})</span>
                <span className="text-secondary">{formatCurrency(0)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            {cancelledTotal > 0 && (
              <div className="flex justify-between text-red-500 line-through text-xs">
                <span>Cancelled items (excluded)</span>
                <span>{formatCurrency(cancelledTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-theme pt-2 border-t border-theme">
              <span>Total Payable</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </section>

          {/* Payment method selector */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-theme">Payment Method</legend>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "cash", label: "Cash" },
                { id: "upi", label: "UPI / QR" },
                { id: "card", label: "Card" },
              ].map(({ id, label }) => (
                <label
                  key={id}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                    paymentMethod === id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-theme text-theme hover:bg-primary-light/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={id}
                    checked={paymentMethod === id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-theme">
            <button type="button" onClick={onClose} className={`${btn("secondary")} cursor-pointer`}>
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className={`${btn("primary")} cursor-pointer`}
            >
              {isSubmitting
                ? "Processing..."
                : unresolved.length > 0
                ? `Deliver & Confirm Payment (${formatCurrency(total)})`
                : `Confirm Payment (${formatCurrency(total)})`}
            </button>
          </div>
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
