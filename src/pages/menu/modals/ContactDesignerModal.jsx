import { useState, useEffect } from "react";
import { Palette, Upload, FileText, X, Send } from "lucide-react";
import { toast } from "sonner";
import { useDesignRequestStore } from "../../../store/designRequestStore";
import Textarea from "../../../components/ui/Textarea";
import Button from "../../../components/ui/Button";
import ModalShell from "./ModalShell";
import { ATTACHMENT_RULES } from "../data/designRequests";

const MAX_DESCRIPTION = 1000;
const MIN_DESCRIPTION = 10;

const getExtension = (name) => name.split(".").pop().toLowerCase();

const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function ContactDesignerModal({ isOpen, onClose }) {
  const addRequest = useDesignRequestStore((s) => s.addRequest);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [descriptionError, setDescriptionError] = useState("");
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);

  // Fresh form every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setDescription("");
      setFile(null);
      setDescriptionError("");
      setFileError("");
      setDragging(false);
    }
  }, [isOpen]);

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

  const handleSubmit = () => {
    const trimmed = description.trim();
    if (trimmed.length < MIN_DESCRIPTION) {
      setDescriptionError(`Please describe your design requirement (at least ${MIN_DESCRIPTION} characters).`);
      return;
    }
    addRequest({ description: trimmed, file });
    toast.success("Design request submitted successfully. Our designer will get in touch.");
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      icon={Palette}
      title="Contact Designer"
      subtitle="Tell us what you need. Your request goes to our design team."
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit}>
            <Send size={16} /> Submit Request
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <Textarea
            label="Design Description"
            required
            rows={5}
            placeholder="e.g., A 2-page A4 menu with a dark theme and gold accents. Our brand colours are..."
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

        <div>
          <p className="text-sm font-medium text-theme mb-2">
            Attachment <span className="text-secondary font-normal">(optional)</span>
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
                className="p-1.5 text-secondary hover:text-red-500 rounded transition-colors"
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
              <Upload size={20} className="text-secondary" />
              <span className="text-sm text-theme">Click to upload or drag and drop</span>
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
