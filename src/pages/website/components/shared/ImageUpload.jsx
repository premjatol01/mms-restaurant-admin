import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { readImageFile } from "../../utils/image";
import { IMAGE_MAX_MB } from "../../utils/constants";
import FieldError from "./FieldError";
import { labelClass } from "./fieldStyles";

// Single image uploader with preview, replace and remove.
// `value` is an image URL (or data URL). `onChange` receives the new URL, or "" when removed.
export default function ImageUpload({
  label,
  value,
  onChange,
  hint = "JPG, PNG or WebP, up to 5 MB",
  aspectClass = "aspect-video",
  maxSizeMB = IMAGE_MAX_MB
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const url = await readImageFile(file, { maxSizeMB });
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    handleFile(e.target.files?.[0]);
    e.target.value = ""; // allow choosing the same file again
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div>
      {label && <label className={labelClass}>{label}</label>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInput}
        className="hidden"
      />

      {value ? (
        <div className={`relative ${aspectClass} w-full max-w-md rounded-lg overflow-hidden border border-theme bg-secondary-soft`}>
          <img src={value} alt={label ?? "Uploaded image"} className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 p-2 bg-black/40">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-white/90 text-gray-800 hover:bg-white"
            >
              {loading ? <LoaderCircle size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-white/90 text-red-600 hover:bg-white"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          disabled={loading}
          className={`flex flex-col items-center justify-center gap-2 ${aspectClass} w-full max-w-md rounded-lg border-2 border-dashed text-center px-4 transition-colors ${
            dragging ? "border-primary bg-primary-soft" : "border-theme hover-bg-primary-soft"
          }`}
        >
          {loading ? (
            <LoaderCircle size={24} className="animate-spin text-primary" />
          ) : (
            <ImagePlus size={24} className="text-primary" />
          )}
          <span className="text-sm font-medium text-theme">
            {loading ? "Uploading..." : "Upload an image"}
          </span>
          <span className="text-xs text-secondary">Click to browse or drop a file here</span>
        </button>
      )}

      <p className="mt-1 text-xs text-secondary">{hint}</p>
      <FieldError message={error} />
    </div>
  );
}
