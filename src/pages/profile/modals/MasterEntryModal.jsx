import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Upload, UtensilsCrossed, X } from "lucide-react";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import Button from "../../../components/ui/Button";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60, "Max 60 characters"),
  description: z.string().max(200, "Max 200 characters").optional().or(z.literal("")),
});

/**
 * Add or edit a master category / menu item.
 *  - mode: "category" | "item"
 *  - entry: existing category / item when editing, undefined when adding
 *  - parentName: category name shown as context when adding an item
 *  - onSubmit(values): async, resolves to { success, message? }.
 *    values = { name, description, image: File | null, removeImage: boolean }
 */
export default function MasterEntryModal({ mode, entry, parentName, onSubmit, onClose }) {
  const noun = mode === "category" ? "category" : "menu item";
  const isEdit = !!entry;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: entry?.name || "", description: entry?.description || "" },
  });

  const inputRef = useRef();
  const [file, setFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !isSubmitting) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, isSubmitting]);

  const displaySrc = preview || (removeImage ? null : entry?.image);

  const pickFile = (picked) => {
    if (!picked) return;
    if (!ACCEPTED.includes(picked.type)) return toast.error("Only JPG, JPEG, PNG, WebP formats are allowed.");
    if (picked.size > MAX_SIZE) return toast.error("File size must be under 2MB.");
    setFile(picked);
    setRemoveImage(false);
  };

  const clearImage = () => {
    setFile(null);
    setRemoveImage(true);
  };

  const submit = async (values) => {
    const result = await onSubmit({
      name: values.name.trim(),
      description: values.description?.trim() || "",
      image: file,
      removeImage: removeImage && !file,
    });
    if (result?.success) {
      toast.success(`${noun[0].toUpperCase()}${noun.slice(1)} ${isEdit ? "updated" : "added"}.`);
      onClose();
    } else {
      toast.error(result?.message || `Failed to save ${noun}.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={isSubmitting ? undefined : onClose}>
      <form
        onSubmit={handleSubmit(submit)}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 p-6 pb-0">
          <div>
            <h3 className="text-base font-semibold text-theme">{isEdit ? `Edit ${noun}` : `Add ${noun}`}</h3>
            {!isEdit && mode === "item" && parentName && (
              <p className="text-xs text-secondary mt-0.5">In {parentName}</p>
            )}
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Close" className="text-secondary hover:text-theme transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Input
            label="Name"
            required
            error={errors.name?.message}
            {...register("name")}
            placeholder={mode === "category" ? "e.g. Starters" : "e.g. Paneer Tikka"}
          />
          <Textarea
            label="Description (optional)"
            rows={2}
            maxLength={200}
            error={errors.description?.message}
            {...register("description")}
            placeholder="Short description..."
          />

          <div>
            <label className="text-sm font-medium text-theme block mb-2">Image (optional)</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-theme overflow-hidden flex items-center justify-center flex-shrink-0 bg-theme">
                {displaySrc
                  ? <img src={displaySrc} alt={`${noun} preview`} className="w-full h-full object-cover" />
                  : <UtensilsCrossed size={24} className="text-secondary opacity-40" />}
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={isSubmitting}>
                    <Upload size={14} /> {displaySrc ? "Replace" : "Upload"}
                  </Button>
                  {displaySrc && (
                    <Button type="button" variant="danger" size="sm" onClick={clearImage} disabled={isSubmitting}>
                      <X size={14} /> Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-secondary">JPG, PNG or WebP, max 2MB</p>
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(",")}
              className="hidden"
              onChange={(e) => { pickFile(e.target.files[0]); e.target.value = ""; }}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end px-6 pb-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>{isEdit ? "Save Changes" : `Add ${noun[0].toUpperCase()}${noun.slice(1)}`}</Button>
        </div>
      </form>
    </div>
  );
}
