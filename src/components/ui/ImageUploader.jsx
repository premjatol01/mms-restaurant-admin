import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Button from "./Button";

export default function ImageUploader({ value, onChange, label }) {
  const [preview, setPreview] = useState(value || null);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(url);
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-theme">{label}</label>}
      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-theme rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-primary)] hover:bg-primary-light/20 transition-colors"
        >
          <Upload size={24} className="text-secondary mb-2" />
          <p className="text-sm text-theme">Upload Image</p>
          <p className="text-xs text-secondary">JPG / PNG / WEBP</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-theme">
          <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
            <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>Replace</Button>
            <Button size="sm" variant="danger" onClick={handleRemove}>Remove</Button>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
        </div>
      )}
    </div>
  );
}