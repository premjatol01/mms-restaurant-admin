import { useRef, useState } from "react";
import { Upload, X, Image } from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "../../store/profileStore";
import Button from "../ui/Button";
import FormSection from "../ui/FormSection";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

function ImageUploader({ label, hint, value, onUpload, onRemove, aspectClass = "aspect-square", previewClass = "" }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const validate = (file) => {
    if (!ACCEPTED.includes(file.type)) return "Only JPG, JPEG, PNG, WebP formats are allowed.";
    if (file.size > MAX_SIZE) return "File size must be under 2MB.";
    return null;
  };

  const handleFile = async (file) => {
    const err = validate(file);
    if (err) { toast.error(err); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    const result = await onUpload(file);
    setUploading(false);
    if (!result.success) {
      toast.error(result.message);
      setPreview(null);
    } else {
      toast.success(`${label} updated successfully.`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = async () => {
    setUploading(true);
    const result = await onRemove();
    setUploading(false);
    setPreview(null);
    if (result.success) toast.success(`${label} removed.`);
    else toast.error(result.message);
  };

  const displaySrc = preview || value;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-theme">{label}</label>
      <div
        className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors ${dragging ? "border-[var(--color-primary)] bg-primary-light" : "border-theme"} ${aspectClass} ${previewClass}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {displaySrc ? (
          <img src={displaySrc} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-secondary">
            <Image size={32} className="opacity-40" />
            <p className="text-xs">Drag & drop or click to upload</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload size={14} /> {displaySrc ? "Replace" : "Upload"}
        </Button>
        {displaySrc && (
          <Button type="button" variant="danger" size="sm" onClick={handleRemove} disabled={uploading}>
            <X size={14} /> Remove
          </Button>
        )}
      </div>
      <p className="text-xs text-secondary">{hint}</p>
      <input ref={inputRef} type="file" accept={ACCEPTED.join(",")} className="hidden" onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
    </div>
  );
}

export default function BrandingForm() {
  const { profile, uploadLogo, removeLogo, uploadCover, removeCover } = useProfileStore();

  return (
    <div className="space-y-5">
      <FormSection title="Restaurant Logo" description="Square image recommended. Shown on menus, website, and receipts.">
        <div className="max-w-xs">
          <ImageUploader
            label="Logo"
            hint="Recommended: Square image, JPG/PNG/WebP, max 2MB"
            value={profile?.logo}
            onUpload={uploadLogo}
            onRemove={removeLogo}
            aspectClass="aspect-square max-w-[160px]"
          />
        </div>
      </FormSection>

      <FormSection title="Cover / Banner Image" description="Wide banner image shown on your restaurant website and profile.">
        <ImageUploader
          label="Cover Image"
          hint="Recommended: 1200×400px, JPG/PNG/WebP, max 2MB"
          value={profile?.coverImage}
          onUpload={uploadCover}
          onRemove={removeCover}
          aspectClass="aspect-[3/1]"
          previewClass="w-full"
        />
      </FormSection>
    </div>
  );
}
