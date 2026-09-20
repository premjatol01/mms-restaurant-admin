import { useState } from "react";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import EditorShell from "../shared/EditorShell";
import ImageUpload from "../shared/ImageUpload";
import FieldError from "../shared/FieldError";
import { validateHero } from "../../utils/validation";

export default function HeroEditor({ section, onSave, onCancel }) {
  const [content, setContent] = useState(section.content);
  const [errors, setErrors] = useState({});

  const setField = (key) => (e) => setContent((c) => ({ ...c, [key]: e.target.value }));

  const handleSave = () => {
    const next = validateHero(content);
    setErrors(next);
    if (Object.keys(next).length === 0) onSave(content);
  };

  return (
    <EditorShell
      title="Hero Section"
      description="The first thing visitors see on your website"
      onBack={onCancel}
      onSave={handleSave}
    >
      <div>
        <Input
          label="Heading"
          value={content.heading}
          onChange={setField("heading")}
          placeholder="Welcome to Tasty Bites"
        />
        <FieldError message={errors.heading} />
      </div>
      <Textarea
        label="Description"
        value={content.description}
        onChange={setField("description")}
        placeholder="Experience delicious food..."
        rows={3}
      />
      <div>
        <Input
          label="CTA Button Label"
          value={content.buttonText}
          onChange={setField("buttonText")}
          placeholder="View Menu"
        />
        <FieldError message={errors.buttonText} />
      </div>
      <ImageUpload
        label="Hero image"
        value={content.imageUrl}
        onChange={(url) => setContent((c) => ({ ...c, imageUrl: url }))}
        hint="Recommended 1920 x 1080 px. JPG, PNG or WebP, up to 5 MB"
        aspectClass="aspect-video"
      />
    </EditorShell>
  );
}
