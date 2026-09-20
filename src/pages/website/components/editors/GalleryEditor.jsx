import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import Button from "../../../../components/ui/Button";
import EditorShell from "../shared/EditorShell";
import FormBlock from "../shared/FormBlock";
import FieldError from "../shared/FieldError";
import { compactInputClass } from "../shared/fieldStyles";
import { readImageFile, makeId } from "../../utils/image";
import { MAX_GALLERY_IMAGES } from "../../utils/constants";

export default function GalleryEditor({ section, onSave, onCancel }) {
  const [content, setContent] = useState(section.content);
  const [errors, setErrors] = useState({});
  const [uploadErrors, setUploadErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const images = content.images;
  const isFull = images.length >= MAX_GALLERY_IMAGES;

  const addFiles = async (fileList) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    const room = Math.max(MAX_GALLERY_IMAGES - images.length, 0);
    const accepted = files.slice(0, room);
    const problems = [];
    if (files.length > accepted.length) {
      problems.push(`The gallery holds up to ${MAX_GALLERY_IMAGES} images. ${files.length - accepted.length} file(s) were skipped.`);
    }

    setUploading(true);
    const results = await Promise.allSettled(accepted.map((file) => readImageFile(file)));
    const added = [];
    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        added.push({ id: makeId("img"), url: result.value, caption: "" });
      } else {
        problems.push(result.reason?.message ?? `${accepted[i].name}: could not add the image`);
      }
    });

    setContent((c) => ({ ...c, images: [...c.images, ...added] }));
    setUploadErrors(problems);
    setUploading(false);
  };

  const handleInput = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const removeImage = (id) =>
    setContent((c) => ({ ...c, images: c.images.filter((img) => img.id !== id) }));

  const setCaption = (id, caption) =>
    setContent((c) => ({ ...c, images: c.images.map((img) => (img.id === id ? { ...img, caption } : img)) }));

  const moveImage = (index, direction) =>
    setContent((c) => {
      const target = index + direction;
      if (target < 0 || target >= c.images.length) return c;
      const next = [...c.images];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...c, images: next };
    });

  const handleSave = () => {
    if (!content.title.trim()) {
      setErrors({ title: "Enter a section title" });
      return;
    }
    setErrors({});
    onSave(content);
  };

  return (
    <EditorShell
      title="Gallery Section"
      description="Photos of your food, drinks and restaurant"
      onBack={onCancel}
      onSave={handleSave}
    >
      <div>
        <Input
          label="Section Title"
          value={content.title}
          onChange={(e) => setContent((c) => ({ ...c, title: e.target.value }))}
          placeholder="Gallery"
        />
        <FieldError message={errors.title} />
      </div>
      <Textarea
        label="Section Description"
        value={content.description}
        onChange={(e) => setContent((c) => ({ ...c, description: e.target.value }))}
        placeholder="A glimpse of our food and ambience"
        rows={2}
      />

      <FormBlock
        title={`Images (${images.length}/${MAX_GALLERY_IMAGES})`}
        description="JPG, PNG or WebP, up to 5 MB each. You can select several files at once."
        action={
          <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading || isFull}>
            {uploading ? <LoaderCircle size={14} className="animate-spin" /> : <ImagePlus size={14} />}
            Add images
          </Button>
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleInput}
          className="hidden"
        />

        {images.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 py-10 rounded-lg border-2 border-dashed border-theme hover-bg-primary-soft"
          >
            <ImagePlus size={24} className="text-primary" />
            <span className="text-sm font-medium text-theme">Add your first images</span>
            <span className="text-xs text-secondary">Photos of dishes, your dining area or your team work well</span>
          </button>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <li key={img.id} className="space-y-2">
                <div className="relative aspect-square rounded-lg overflow-hidden border border-theme bg-secondary-soft">
                  <img src={img.url} alt={img.caption || `Gallery image ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-white/90 text-red-600 hover:bg-white"
                    title="Remove image"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <Trash2 size={14} />
                  </button>
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 text-xs rounded bg-black/50 text-white">{index + 1}</span>
                </div>
                <input
                  type="text"
                  value={img.caption}
                  onChange={(e) => setCaption(img.id, e.target.value)}
                  placeholder="Caption (optional)"
                  maxLength={80}
                  className={compactInputClass}
                  aria-label={`Caption for image ${index + 1}`}
                />
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    className="p-1 text-secondary hover-text-primary hover-bg-primary-soft rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move earlier"
                    aria-label={`Move image ${index + 1} earlier`}
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    className="p-1 text-secondary hover-text-primary hover-bg-primary-soft rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move later"
                    aria-label={`Move image ${index + 1} later`}
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {uploadErrors.length > 0 && (
          <ul className="space-y-0.5">
            {uploadErrors.map((message) => (
              <li key={message}><FieldError message={message} /></li>
            ))}
          </ul>
        )}
      </FormBlock>
    </EditorShell>
  );
}
