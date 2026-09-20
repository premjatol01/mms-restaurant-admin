import { useState, useEffect } from "react";
import { Upload, X, Send, Copy, Loader2, AlertTriangle, QrCode, Clock } from "lucide-react";
import { toast } from "sonner";
import { useSubscriptionStore } from "../../../store/subscriptionStore";
import Drawer from "../../../components/ui/Drawer";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";
import { BILLING_CYCLE_LABELS, DEFAULT_PAYMENT_INSTRUCTIONS, SCREENSHOT_RULES } from "../data/subscriptionConfig";
import { formatCurrency, validateScreenshot, readFileAsDataURL, formatFileSize, copyText, getRenewalState } from "../utils/subscriptionUtils";

/**
 * Renewal / payment interface. Workflow (no payment gateway):
 * pay via the Super Admin's QR -> upload screenshot -> submit -> Super Admin verifies.
 */
export default function RenewalDrawer({ isOpen, onClose }) {
  const { subscription, paymentConfig, requests, submitting, submitRenewal } = useSubscriptionStore();
  const [screenshot, setScreenshot] = useState(null); // { name, size, type, dataUrl }
  const [transactionRef, setTransactionRef] = useState("");
  const [fileError, setFileError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Fresh form every time the drawer opens
  useEffect(() => {
    if (isOpen) {
      setScreenshot(null);
      setTransactionRef("");
      setFileError("");
      setSubmitError("");
      setReading(false);
      setDragging(false);
    }
  }, [isOpen]);

  if (!subscription || !paymentConfig) return null;

  const hasPending = getRenewalState(requests).hasPending;
  const qrAvailable = Boolean(paymentConfig.qrImage);
  const amountText = formatCurrency(subscription.amount);
  const instructions = (paymentConfig.instructions?.length ? paymentConfig.instructions : DEFAULT_PAYMENT_INSTRUCTIONS).map((line) =>
    line.replaceAll("{amount}", amountText)
  );
  const canSubmit = Boolean(screenshot) && qrAvailable && !hasPending && !submitting && !reading;

  const handleClose = () => {
    if (!submitting) onClose();
  };

  const handleFile = async (file) => {
    if (!file) return;
    const error = validateScreenshot(file);
    if (error) {
      setFileError(error);
      return;
    }
    setFileError("");
    setReading(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      setScreenshot({ name: file.name, size: file.size, type: file.type, dataUrl });
    } catch (e) {
      setFileError(e.message);
    } finally {
      setReading(false);
    }
  };

  const handleCopyUpi = async () => {
    const ok = await copyText(paymentConfig.upiId);
    ok ? toast.success("UPI ID copied to clipboard.") : toast.error("Couldn't copy the UPI ID.");
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitError("");
    try {
      await submitRenewal({ screenshot, transactionRef });
      toast.success("Renewal request submitted. It is now pending review.");
      onClose();
    } catch (error) {
      if (error.code === "BUSY") return;
      if (error.code === "PENDING_EXISTS") {
        toast.error(error.message);
        onClose();
        return;
      }
      setSubmitError(error.message || "Something went wrong. Please try again.");
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Renew Subscription" size="md">
      <div className="space-y-6">
        {hasPending && (
          <div className="flex items-start gap-3 rounded-lg border border-blue-300 bg-blue-50 p-4 text-blue-700">
            <Clock size={18} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">A renewal request is already pending review, so a new one can't be submitted right now.</p>
          </div>
        )}

        <FormSection title="1. Amount to pay">
          <div className="rounded-lg border border-theme p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Plan</span>
              <span className="text-theme font-medium">{subscription.planName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Billing cycle</span>
              <span className="text-theme font-medium">{BILLING_CYCLE_LABELS[subscription.billingCycle] || subscription.billingCycle}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-theme">
              <span className="text-sm text-secondary">Amount payable</span>
              <span className="text-2xl font-bold text-theme" data-testid="renewal-amount">{amountText}</span>
            </div>
          </div>
        </FormSection>

        <FormSection title="2. Scan the QR code to pay">
          {qrAvailable ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-theme p-4">
              <img
                src={paymentConfig.qrImage}
                alt="Payment QR code"
                className="w-56 h-56 object-contain bg-white rounded-lg border border-theme p-2"
              />
              {paymentConfig.payeeName && <p className="text-sm font-medium text-theme text-center">{paymentConfig.payeeName}</p>}
              {paymentConfig.upiId && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-secondary">UPI ID:</span>
                  <span className="text-theme font-medium">{paymentConfig.upiId}</span>
                  <button type="button" onClick={handleCopyUpi} aria-label="Copy UPI ID" className="p-1.5 text-secondary hover:text-theme rounded hover:bg-primary-light">
                    <Copy size={14} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
              <QrCode size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Payment QR isn't available yet</p>
                <p className="text-sm text-gray-700 mt-0.5">The platform team hasn't set up the payment QR. Please contact support to renew your subscription.</p>
              </div>
            </div>
          )}
        </FormSection>

        <FormSection title="3. How to pay">
          <ol className="space-y-2">
            {instructions.map((line, index) => (
              <li key={index} className="flex gap-3 text-sm text-theme">
                <span className="w-5 h-5 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </FormSection>

        <FormSection title="4. Upload payment screenshot">
          <div className="space-y-4">
            {screenshot ? (
              <div className="flex items-center gap-3 border border-theme rounded-lg p-3">
                <img src={screenshot.dataUrl} alt="Payment screenshot preview" className="w-16 h-16 rounded-lg object-cover border border-theme flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-theme truncate">{screenshot.name}</p>
                  <p className="text-xs text-secondary">{formatFileSize(screenshot.size)}</p>
                </div>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setScreenshot(null)}
                  aria-label="Remove screenshot"
                  className="p-1.5 text-secondary hover:text-red-500 rounded transition-colors disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragging ? "border-transparent bg-primary-light" : "border-theme hover:bg-primary-light/10"
                }`}
              >
                {reading ? <Loader2 size={20} className="text-secondary animate-spin" /> : <Upload size={20} className="text-secondary" />}
                <span className="text-sm text-theme">{reading ? "Reading file..." : "Click to upload or drag and drop"}</span>
                <span className="text-xs text-secondary">{SCREENSHOT_RULES.label}</span>
                <input
                  type="file"
                  accept={SCREENSHOT_RULES.accept}
                  className="hidden"
                  data-testid="screenshot-input"
                  onChange={(e) => {
                    handleFile(e.target.files?.[0]);
                    e.target.value = ""; // allow re-selecting the same file
                  }}
                />
              </label>
            )}
            {fileError && <p className="text-xs text-red-500">{fileError}</p>}

            <Input
              label="Transaction / UTR reference (optional)"
              placeholder="e.g., 402938451726"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
            />
          </div>
        </FormSection>

        {submitError && (
          <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-3 text-red-700">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">{submitError}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-theme">
          <Button variant="secondary" className="flex-1" disabled={submitting} onClick={handleClose}>Cancel</Button>
          <Button className="flex-1" disabled={!canSubmit} onClick={handleSubmit}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {submitting ? "Submitting..." : "Submit Renewal Request"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
