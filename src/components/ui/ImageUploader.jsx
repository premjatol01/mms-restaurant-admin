import { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import Button from "./Button";
import { getImageUrl } from "../../utils/getImageUrl";

export default function ImageUploader({ value, onChange, label }) {
  const [preview, setPreview] = useState(() => {
    if (!value) return null;
    if (value instanceof File) return URL.createObjectURL(value);
    return value;
  });
  const inputRef = useRef(null);

  // Synchronize preview whenever value prop changes (e.g. edit item loaded, form reset)
  useEffect(() => {
    if (!value) {
      setPreview(null);
    } else if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === "string") {
      setPreview(value);
    }
  }, [value]);

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(file);
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleReplaceClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const handleRemoveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-theme">{label}</label>}
      {!preview ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.value = "";
              inputRef.current.click();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className="border-2 border-dashed border-theme rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-primary)] hover:bg-primary-light/20 transition-colors"
        >
          <Upload size={24} className="text-secondary mb-2" />
          <p className="text-sm text-theme font-medium">Upload Image</p>
          <p className="text-xs text-secondary mt-0.5">JPG / PNG / WEBP</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-theme group">
          <img
            src={getImageUrl(preview)}
            alt="Preview"
            className="w-full h-44 object-cover"
            onError={(e) => {
              // Hide broken image link if file cannot be fetched
              e.currentTarget.classList.add("opacity-50");
            }}
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleReplaceClick}
            >
              Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={handleRemoveClick}
            >
              Remove
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
}