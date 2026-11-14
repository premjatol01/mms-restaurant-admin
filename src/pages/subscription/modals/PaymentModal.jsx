import { useState, useEffect } from "react";
import { Upload, X, Copy, Check, QrCode, AlertCircle, FileText, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { useSubscriptionStore } from "../../../store/subscriptionStore";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { getImageUrl } from "../../../utils/getImageUrl";
import { DUMMY_PAYMENT_QR } from "../data/paymentQr";

export default function PaymentModal({ isOpen, onClose, targetPackage, selectedPricing, requestType = "renew" }) {
  const { paymentConfig, submitPayment, submitting } = useSubscriptionStore();

  const [screenshotFile, setScreenshotFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [transactionRef, setTransactionRef] = useState("");
  const [userNote, setUserNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setScreenshotFile(null);
      setPreviewUrl(null);
      setTransactionRef("");
      setUserNote("");
      setFileError("");
      setCopied(false);
    }
  }, [isOpen]);

  if (!targetPackage) return null;

  const packageName = targetPackage.name;
  const packageId = targetPackage._id || targetPackage.id;
  const price = selectedPricing?.price ?? targetPackage.price ?? 0;
  const duration = selectedPricing?.duration ?? targetPackage.duration ?? "30_days";
  const durationDays = selectedPricing?.durationDays ?? targetPackage.durationDays ?? 30;
  const durationDisplay = selectedPricing?.durationDisplay ?? targetPackage.durationDisplay ?? `${durationDays} Days`;
  const isTrial = Number(price) === 0 || packageName.toLowerCase().includes("trial");

  const upiId = paymentConfig?.paymentUpiId || "tablly@upi";
  const accountName = paymentConfig?.paymentAccountName || "Tablly Technologies";
  const bankDetails = paymentConfig?.paymentBankDetails || "";
  const instructions = paymentConfig?.paymentInstructions || "Scan the QR code using any UPI app (GPay, PhonePe, Paytm), pay the amount, and upload the screenshot.";
  const qrImage = paymentConfig?.paymentQrUrl ? getImageUrl(paymentConfig.paymentQrUrl) : DUMMY_PAYMENT_QR;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError("Only image files (JPG, PNG, WebP) are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("Screenshot size must be under 5 MB.");
      return;
    }

    setFileError("");
    setScreenshotFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setFileError("Only image files are allowed.");
        return;
      }
      setFileError("");
      setScreenshotFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isTrial && !screenshotFile) {
      setFileError("Please upload your payment screenshot.");
      return;
    }

    try {
      const formData = new FormData();
      if (screenshotFile) {
        formData.append("screenshot", screenshotFile);
      }
      formData.append("packageId", packageId);
      formData.append("packageName", packageName);
      formData.append("duration", duration);
      formData.append("durationDays", durationDays);
      formData.append("durationDisplay", durationDisplay);
      formData.append("amount", price);
      formData.append("transactionRef", transactionRef.trim());
      formData.append("userNote", userNote.trim());
      formData.append("requestType", requestType);

      const res = await submitPayment(formData);
      if (isTrial) {
        toast.success(res?.message || "🎉 1-Month Free Trial activated successfully!");
      } else {
        toast.success("Payment submitted successfully! Super admin will verify your screenshot and confirm your subscription.");
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to submit request");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isTrial ? "Activate 1-Month Free Trial" : requestType === "renew" ? "Renew Subscription Plan" : `Buy ${packageName} Plan`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Package & Amount Summary Banner */}
        <div className="bg-primary-light/30 border border-theme rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Selected Package</span>
            <h3 className="text-lg font-bold text-theme">{packageName}</h3>
            <p className="text-xs text-secondary mt-0.5">Billing duration: <strong>{durationDisplay}</strong></p>
          </div>
          <div className="sm:text-right">
            <span className="text-xs text-secondary">Payable Amount</span>
            <div className="text-2xl font-black text-theme flex items-center sm:justify-end gap-0.5">
              {isTrial ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xl">₹0 · 100% Free</span>
              ) : (
                <>
                  <IndianRupee size={20} className="text-primary" />
                  {Number(price).toLocaleString("en-IN")}
                </>
              )}
            </div>
          </div>
        </div>

        {/* If Free Trial: Show Instant Free Activation Banner */}
        {isTrial ? (
          <div className="border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-lg">
                🎁
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-theme">Full Access Included for 30 Days</h4>
                <p className="text-xs text-secondary leading-relaxed">
                  Start your 30 days free trial with zero payment and no credit card required. You get up to 15 tables capacity, digital QR ordering, table games, waiter calling, and marketing features immediately!
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-500/20">
              <Input
                label="Optional Note / Remarks"
                placeholder="e.g., Excited to try Tablly for our cafe!"
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Scan QR Code & Pay */}
            <div className="border border-theme rounded-xl p-4 bg-surface space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-theme">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
                <h4 className="text-sm font-semibold text-theme">Scan QR Code & Pay</h4>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* QR Code Container */}
                <div className="relative p-2.5 bg-white border border-theme rounded-xl shadow-sm shrink-0 flex flex-col items-center">
                  <img
                    src={qrImage}
                    alt="Payment QR Code"
                    className="w-40 h-40 object-contain rounded"
                  />
                  <span className="text-[10px] text-gray-500 font-medium mt-1">Scan via GPay / PhonePe / Paytm</span>
                </div>

                {/* UPI & Bank Details */}
                <div className="flex-1 space-y-3 w-full">
                  <div className="p-3 bg-surface border border-theme rounded-lg space-y-1">
                    <span className="text-[11px] text-secondary font-medium block">UPI ID for payment:</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-mono font-bold text-theme select-all">{upiId}</span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-primary-light text-primary hover:bg-primary-light/80 font-medium transition-colors"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-secondary">
                    <p><strong className="text-theme">Account Name:</strong> {accountName}</p>
                    {bankDetails && <p><strong className="text-theme">Bank Details:</strong> {bankDetails}</p>}
                    <p className="text-[11px] text-secondary/80 mt-1">{instructions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Upload Screenshot & Enter Reference */}
            <div className="border border-theme rounded-xl p-4 bg-surface space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-theme">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
                <h4 className="text-sm font-semibold text-theme">Upload Payment Proof & Reference</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Transaction ID / UTR Number"
                  placeholder="e.g., 402198765432"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  helper="12-digit UTR from your UPI payment app"
                />
                <Input
                  label="Optional Note"
                  placeholder="e.g., Paid via HDFC account"
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                />
              </div>

              {/* Screenshot Uploader */}
              <div>
                <label className="text-xs font-medium text-theme block mb-1">
                  Payment Screenshot <span className="text-red-500">*</span>
                </label>

                {!previewUrl ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-theme rounded-xl p-6 text-center hover:border-primary/60 transition-colors bg-surface/50 cursor-pointer"
                    onClick={() => document.getElementById("payment-ss-input")?.click()}
                  >
                    <Upload size={28} className="mx-auto text-secondary mb-2" />
                    <p className="text-xs font-semibold text-theme">Click to upload or drag & drop payment screenshot</p>
                    <p className="text-[11px] text-secondary mt-1">PNG, JPG, WebP up to 5 MB</p>
                    <input
                      id="payment-ss-input"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="relative border border-theme rounded-xl p-3 bg-surface flex items-center gap-3">
                    <img
                      src={previewUrl}
                      alt="Payment screenshot preview"
                      className="w-16 h-16 object-cover rounded-lg border border-theme shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-theme truncate">{screenshotFile?.name}</p>
                      <p className="text-[11px] text-secondary">
                        {screenshotFile?.size ? `${(screenshotFile.size / 1024).toFixed(1)} KB` : "Uploaded screenshot"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotFile(null);
                        setPreviewUrl(null);
                      }}
                      className="p-1.5 text-secondary hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove screenshot"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {fileError && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {fileError}</p>}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3 border-t border-theme">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={submitting} disabled={submitting || (!isTrial && !screenshotFile)}>
            {isTrial ? "Activate 30 Days Free Trial Now" : "Submit Payment for Verification"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
