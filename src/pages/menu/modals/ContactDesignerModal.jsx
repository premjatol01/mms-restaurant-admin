import { useState, useEffect } from "react";
import { Palette, Upload, FileText, X, Send, UtensilsCrossed, QrCode, Tag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useDesignRequestStore } from "../../../store/designRequestStore";
import Textarea from "../../../components/ui/Textarea";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import ModalShell from "./ModalShell";
import { ATTACHMENT_RULES } from "../data/designRequests";

const MAX_DESCRIPTION = 1000;
const MIN_DESCRIPTION = 10;

const getExtension = (name) => name.split(".").pop().toLowerCase();

const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function ContactDesignerModal({ isOpen, onClose, initialRequestType = "Menu Design" }) {
  const addRequest = useDesignRequestStore((s) => s.addRequest);
  const [requestType, setRequestType] = useState(initialRequestType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [descriptionError, setDescriptionError] = useState("");
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fresh form every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setRequestType(initialRequestType || "Menu Design");
      setTitle("");
      setDescription("");
      setFile(null);
      setDescriptionError("");
      setFileError("");
      setDragging(false);
    }
  }, [isOpen, initialRequestType]);

  // Thumbnail for image attachments
  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (selected) => {
    if (!selected) return;
    if (!ATTACHMENT_RULES.extensions.includes(getExtension(selected.name))) {
      setFileError(`Unsupported file type. Allowed: ${ATTACHMENT_RULES.label}.`);
      return;
    }
    if (selected.size > ATTACHMENT_RULES.maxSizeMB * 1024 * 1024) {
      setFileError(`File is too large. Maximum size is ${ATTACHMENT_RULES.maxSizeMB} MB.`);
      return;
    }
    setFileError("");
    setFile(selected);
  };

  const handleSubmit = async () => {
    const trimmed = description.trim();
    if (trimmed.length < MIN_DESCRIPTION) {
      setDescriptionError(`Please describe your design requirement (at least ${MIN_DESCRIPTION} characters).`);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addRequest({ 
        description: trimmed, 
        requestType, 
        title: title.trim(), 
        file 
      });
      toast.success("Design request submitted successfully! You can track its progress in Design Requests.");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit design request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      icon={Palette}
      title="Request Designer Service"
      subtitle="Tell our professional design team what you need. Track progress and download finished assets directly."
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit} loading={isSubmitting}>
            <Send size={16} /> Submit Request
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Request Type Selector */}
        <div>
          <label className="block text-sm font-medium text-theme mb-2">
            Request Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setRequestType("Menu Design")}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                requestType === "Menu Design"
                  ? "border-primary bg-primary-light/40 ring-2 ring-primary/20"
                  : "border-theme bg-surface hover:bg-primary-light/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${requestType === "Menu Design" ? "bg-primary text-white" : "bg-primary-light text-primary"}`}>
                  <UtensilsCrossed size={16} />
                </div>
                <span className="text-sm font-semibold text-theme">Menu Design</span>
              </div>
              <p className="text-xs text-secondary mt-1">Food menus, pricing cards & specials</p>
            </button>

            <button
              type="button"
              onClick={() => setRequestType("QR Template Design")}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                requestType === "QR Template Design"
                  ? "border-primary bg-primary-light/40 ring-2 ring-primary/20"
                  : "border-theme bg-surface hover:bg-primary-light/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${requestType === "QR Template Design" ? "bg-primary text-white" : "bg-primary-light text-primary"}`}>
                  <QrCode size={16} />
                </div>
                <span className="text-sm font-semibold text-theme">QR Template</span>
              </div>
              <p className="text-xs text-secondary mt-1">Table standees, tent cards & branded QR</p>
            </button>

            <button
              type="button"
              onClick={() => setRequestType("Offer Banner Design")}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                requestType === "Offer Banner Design"
                  ? "border-primary bg-primary-light/40 ring-2 ring-primary/20"
                  : "border-theme bg-surface hover:bg-primary-light/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${requestType === "Offer Banner Design" ? "bg-primary text-white" : "bg-primary-light text-primary"}`}>
                  <Sparkles size={16} />
                </div>
                <span className="text-sm font-semibold text-theme">Offer Banner</span>
              </div>
              <p className="text-xs text-secondary mt-1">Promo banners, discount posters & hero ads</p>
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <Input
            label="Request Title (Optional)"
            placeholder="e.g. Summer Beverage Menu or Weekend 20% Off Banner"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description Textarea */}
        <div>
          <Textarea
            label="Design Instructions & Requirements"
            required
            rows={4}
            placeholder={
              requestType === "Offer Banner Design"
                ? "e.g. A high-converting 16:9 banner for our '20% OFF on Orders Above ₹1000' promotion. Emphasize our signature biryani and cocktails with festive colors..."
                : requestType === "QR Template Design"
                ? "e.g. A vertical table tent QR code card matching our restaurant's dark green and gold branding, including our logo and WiFi details..."
                : "e.g. A 2-page A4 menu with modern clean layout, highlighted chef specials, and allergen icons. Our brand colors are navy blue and gold..."
            }
            value={description}
            onChange={(e) => {
              setDescription(e.target.value.slice(0, MAX_DESCRIPTION));
              if (descriptionError) setDescriptionError("");
            }}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-red-500">{descriptionError}</p>
            <p className="text-xs text-secondary">{description.length}/{MAX_DESCRIPTION}</p>
          </div>
        </div>

        {/* Attachment Upload */}
        <div>
          <p className="text-sm font-medium text-theme mb-2">
            Reference Files / Brand Assets <span className="text-secondary font-normal">(optional)</span>
          </p>

          {file ? (
            <div className="flex items-center gap-3 border border-theme rounded-lg p-3">
              <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0 overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <FileText size={18} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-theme truncate">{file.name}</p>
                <p className="text-xs text-secondary">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove attachment"
                className="p-1.5 text-secondary hover:text-red-500 rounded transition-colors cursor-pointer"
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
              className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                dragging ? "border-transparent bg-primary-light" : "border-theme hover:bg-primary-light/10"
              }`}
            >
              <Upload size={20} className="text-secondary" />
              <span className="text-sm text-theme font-medium">Click to upload reference file or drag & drop</span>
              <span className="text-xs text-secondary">{ATTACHMENT_RULES.label}</span>
              <input
                type="file"
                accept={ATTACHMENT_RULES.accept}
                className="hidden"
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = ""; // allow re-selecting the same file
                }}
              />
            </label>
          )}
          {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
        </div>
      </div>
    </ModalShell>
  );
}
