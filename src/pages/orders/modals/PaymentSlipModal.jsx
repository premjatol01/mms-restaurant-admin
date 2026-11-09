import React, { useRef } from "react";
import { 
  CheckCircle2, 
  Download, 
  Printer, 
  Share2, 
  X, 
  Receipt,
  Copy,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "../../../store/profileStore";
import { useOrdersStore } from "../../../store/ordersStore";
import { formatCurrency, formatTime, getSessionOrders, isItemCancelled, getActiveQty } from "../utils/orderUtils";

export default function PaymentSlipModal({ session, isOpen, onClose }) {
  const profile = useProfileStore((state) => state.profile);
  const orders = useOrdersStore((state) => state.orders);
  const getTableName = useOrdersStore((state) => state.getTableName);
  const slipRef = useRef(null);

  if (!isOpen || !session) return null;

  const tableName = getTableName(session.tableId);
  const sessionOrders = getSessionOrders(session, orders);

  // Consolidate billed items
  const consolidated = {};
  sessionOrders
    .filter((o) => o.status !== "cancelled")
    .forEach((order) => {
      (order.items || []).forEach((item) => {
        const liveQty = getActiveQty(item);
        if (liveQty <= 0) return;
        const key = item.menuItemId || item.name;
        if (consolidated[key]) {
          consolidated[key].quantity += liveQty;
          consolidated[key].total += item.price * liveQty;
        } else {
          consolidated[key] = {
            name: item.name,
            quantity: liveQty,
            price: item.price,
            total: item.price * liveQty,
          };
        }
      });
    });

  const itemsList = Object.values(consolidated);
  const rawSubtotal = itemsList.reduce((sum, i) => sum + i.total, 0);
  const subtotal = session.subtotal ?? rawSubtotal;
  const discount = session.discount ?? 0;
  const gst = session.gst ?? 0;
  const total = session.total ?? Math.max(0, subtotal + gst - discount);
  const paymentMethod = (session.paymentMethod || "CASH").toUpperCase();

  const isGstEnabled = Boolean(profile?.gstSettings?.enabled && gst > 0);
  const gstRate = Number(profile?.gstSettings?.percentage ?? 5);

  const receiptDate = session.paidAt || session.closedAt || new Date();
  const formattedDate = new Date(receiptDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = new Date(receiptDate).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const restaurantName = profile?.name || "Restaurant";
  const restaurantAddress = profile?.address?.line1 
    ? `${profile.address.line1}, ${profile.address.city || ""}`
    : profile?.address?.city || "";
  const restaurantPhone = profile?.contact?.primaryPhone || profile?.admin?.phone || "";
  const gstNumber = profile?.gstSettings?.gstNumber || "";

  // Print slip
  const handlePrint = () => {
    window.print();
  };

  // Download plain text slip
  const handleDownload = () => {
    let text = `========================================\n`;
    text += `          ${restaurantName.toUpperCase()}\n`;
    if (restaurantAddress) text += `     ${restaurantAddress}\n`;
    if (restaurantPhone) text += `        Phone: ${restaurantPhone}\n`;
    if (gstNumber && isGstEnabled) text += `       GSTIN: ${gstNumber}\n`;
    text += `========================================\n`;
    text += `Receipt: ${session.sessionNumber}   Table: ${tableName}\n`;
    text += `Date: ${formattedDate} ${formattedTime}\n`;
    text += `Payment: ${paymentMethod} (PAID)\n`;
    if (session.customerMobile) text += `Customer: +91 ${session.customerMobile}\n`;
    text += `----------------------------------------\n`;
    text += `Item                 Qty   Rate   Amount\n`;
    text += `----------------------------------------\n`;
    itemsList.forEach((item) => {
      const name = item.name.padEnd(20).slice(0, 20);
      const qty = String(item.quantity).padStart(3);
      const rate = String(item.price).padStart(6);
      const amt = String(item.total).padStart(8);
      text += `${name} ${qty} ${rate} ${amt}\n`;
    });
    text += `----------------------------------------\n`;
    text += `Subtotal:                        ₹${subtotal}\n`;
    if (discount > 0) text += `Discount:                       -₹${discount}\n`;
    if (isGstEnabled) text += `GST (${gstRate}%):                      ₹${gst}\n`;
    text += `========================================\n`;
    text += `TOTAL PAID:                      ₹${total}\n`;
    text += `========================================\n`;
    text += `       THANK YOU! VISIT AGAIN ✨\n`;
    text += `========================================\n`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt-${session.sessionNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded successfully!");
  };

  // Share via WhatsApp or Copy Text
  const handleShare = () => {
    const summary = `🧾 *${restaurantName}* - Bill Receipt\nTable: ${tableName} | Bill: #${session.sessionNumber}\nDate: ${formattedDate} ${formattedTime}\nTotal Paid: ₹${total} (${paymentMethod})\nThank you for dining with us!`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(summary)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCopySummary = () => {
    const summary = `${restaurantName} - Bill Receipt\nTable: ${tableName} | Session: ${session.sessionNumber}\nDate: ${formattedDate} ${formattedTime}\nTotal Paid: ₹${total} (${paymentMethod})`;
    navigator.clipboard.writeText(summary);
    toast.success("Receipt details copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs print:hidden" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative bg-surface w-full max-w-lg rounded-2xl border border-theme shadow-2xl flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-theme bg-primary-light/10 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-theme">Payment Recorded</h2>
              <p className="text-[11px] text-secondary">Receipt #{session.sessionNumber}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-secondary hover:text-theme rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 dark:bg-slate-950/40 print:p-0 print:bg-white flex justify-center">
          {/* Realistic Receipt Paper */}
          <div 
            ref={slipRef}
            className="w-full max-w-[380px] bg-white text-slate-900 rounded-xl border border-dashed border-slate-300 shadow-md p-6 font-mono text-xs space-y-4 print:shadow-none print:border-none print:p-2 print:max-w-[320px]"
          >
            {/* Top Restaurant Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
              <h1 className="text-base font-extrabold tracking-wide uppercase font-sans text-slate-900">
                {restaurantName}
              </h1>
              {restaurantAddress && (
                <p className="text-[11px] text-slate-600 leading-tight">
                  {restaurantAddress}
                </p>
              )}
              {restaurantPhone && (
                <p className="text-[11px] text-slate-600">
                  Ph: {restaurantPhone}
                </p>
              )}
              {isGstEnabled && gstNumber && (
                <p className="text-[11px] font-bold text-slate-700 tracking-wider">
                  GSTIN: {gstNumber}
                </p>
              )}
              <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase font-sans">
                Tax Invoice / Cash Receipt
              </div>
            </div>

            {/* Receipt Meta Line */}
            <div className="grid grid-cols-2 gap-1 text-[11px] pb-3 border-b border-dashed border-slate-300">
              <div>
                <span className="text-slate-500">Bill No:</span>{" "}
                <span className="font-bold text-slate-800">#{session.sessionNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Table:</span>{" "}
                <span className="font-bold text-slate-800">{tableName}</span>
              </div>
              <div>
                <span className="text-slate-500">Date:</span>{" "}
                <span className="font-semibold text-slate-800">{formattedDate}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Time:</span>{" "}
                <span className="font-semibold text-slate-800">{formattedTime}</span>
              </div>
              {session.customerMobile && (
                <div className="col-span-2">
                  <span className="text-slate-500">Customer:</span>{" "}
                  <span className="font-semibold text-slate-800">+91 {session.customerMobile}</span>
                </div>
              )}
              <div className="col-span-2 flex items-center justify-between pt-1">
                <span className="text-slate-500">Payment:</span>
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 text-[10px]">
                  PAID VIA {paymentMethod}
                </span>
              </div>
            </div>

            {/* Itemized Table */}
            <div>
              <div className="flex justify-between font-bold text-[11px] pb-1.5 border-b border-slate-300 uppercase tracking-wider text-slate-600">
                <span className="flex-1">Item</span>
                <span className="w-10 text-center">Qty</span>
                <span className="w-14 text-right">Price</span>
                <span className="w-16 text-right">Amount</span>
              </div>

              <div className="divide-y divide-dashed divide-slate-200 py-1">
                {itemsList.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5 text-[11px]">
                    <span className="flex-1 pr-2 truncate font-medium text-slate-800">
                      {item.name}
                    </span>
                    <span className="w-10 text-center text-slate-600">
                      {item.quantity}
                    </span>
                    <span className="w-14 text-right text-slate-600">
                      ₹{item.price}
                    </span>
                    <span className="w-16 text-right font-bold text-slate-900">
                      ₹{item.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Offer Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              {isGstEnabled && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>GST ({gstRate}%)</span>
                    <span className="font-semibold text-slate-800">₹{gst}</span>
                  </div>
                  {/* Standard CGST / SGST breakdown */}
                  <div className="flex justify-between text-[10px] text-slate-500 pl-2">
                    <span>CGST ({(gstRate / 2).toFixed(1)}%)</span>
                    <span>₹{Math.round(gst / 2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pl-2">
                    <span>SGST ({(gstRate / 2).toFixed(1)}%)</span>
                    <span>₹{gst - Math.round(gst / 2)}</span>
                  </div>
                </>
              )}

              {/* Grand Total */}
              <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span>NET TOTAL PAID</span>
                <span className="text-base">₹{total}</span>
              </div>
            </div>

            {/* Bottom Greeting & Footer */}
            <div className="text-center pt-3 border-t border-dashed border-slate-300 space-y-1">
              <p className="font-bold text-[11px] text-slate-800">
                THANK YOU FOR DINING WITH US!
              </p>
              <p className="text-[10px] text-slate-500">
                Please visit again ✨
              </p>
              <p className="text-[9px] text-slate-400 pt-1">
                Powered by Tablly Digital Dining
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3.5 border-t border-theme bg-surface flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={handleCopySummary}
            className="text-xs text-secondary hover:text-theme flex items-center gap-1.5 cursor-pointer"
          >
            <Copy size={14} /> Copy Receipt Text
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Print Receipt"
            >
              <Printer size={15} /> Print
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-theme text-theme hover:bg-primary-light/15 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Save / Download Receipt"
            >
              <Download size={15} /> Save
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-theme text-theme hover:bg-primary-light/15 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Share via WhatsApp"
            >
              <Share2 size={15} /> Share
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-theme hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer ml-1"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
