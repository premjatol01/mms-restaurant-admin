import { useState } from "react";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import EditorShell from "../shared/EditorShell";
import ImageUpload from "../shared/ImageUpload";
import FieldError from "../shared/FieldError";

export default function AboutEditor({ section, onSave, onCancel }) {
  const [content, setContent] = useState(section.content);
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!content.title.trim()) {
      setError("Enter a section title");
      return;
    }
    onSave(content);
  };

  return (
    <EditorShell
      title="About Section"
      description="Tell visitors your restaurant's story"
      onBack={onCancel}
      onSave={handleSave}
    >
      <div>
        <Input
          label="Title"
          value={content.title}
          onChange={(e) => setContent((c) => ({ ...c, title: e.target.value }))}
          placeholder="About Tasty Bites"
        />
        <FieldError message={error} />
      </div>
      <Textarea
        label="Description"
        value={content.description}
        onChange={(e) => setContent((c) => ({ ...c, description: e.target.value }))}
        placeholder="Restaurant description..."
        rows={4}
      />
      <ImageUpload
        label="About Us image"
        value={content.imageUrl}
        onChange={(url) => setContent((c) => ({ ...c, imageUrl: url }))}
        hint="Recommended 1200 x 900 px. JPG, PNG or WebP, up to 5 MB"
        aspectClass="aspect-[4/3]"
      />
    </EditorShell>
  );
}
