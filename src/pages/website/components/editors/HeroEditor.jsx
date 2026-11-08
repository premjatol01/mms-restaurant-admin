import { useState, useEffect } from "react";
import { useProfileStore } from "../../../../store/profileStore";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import EditorShell from "../shared/EditorShell";
import ImageUpload from "../shared/ImageUpload";
import FieldError from "../shared/FieldError";
import { validateHero } from "../../utils/validation";

export default function HeroEditor({ section, onSave, onCancel }) {
  const profileCover = useProfileStore((s) => s.profile?.coverImage);
  const initialImageUrl = section.content?.imageUrl || profileCover || "";

  const [content, setContent] = useState({
    ...section.content,
    imageUrl: initialImageUrl
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // If the section didn't have an image, but profile has a cover image, populate it
    if (!content.imageUrl && profileCover) {
      setContent((c) => ({ ...c, imageUrl: profileCover }));
    }
  }, [profileCover]);

  const setField = (key) => (e) => setContent((c) => ({ ...c, [key]: e.target.value }));

  const handleSave = () => {
    const next = validateHero(content);
    setErrors(next);
    if (Object.keys(next).length === 0) onSave(content);
  };

  return (
    <EditorShell
      title="Hero Section"
      description="The main header banner visitors see when they open your restaurant website"
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
      <div>
        <ImageUpload
          label="Hero image / Cover banner"
          value={content.imageUrl}
          onChange={(url) => setContent((c) => ({ ...c, imageUrl: url }))}
          hint="Synced with your restaurant profile Cover / Banner image. Updating here or in Profile keeps both in sync. Recommended: 1200×400px (3:1) or 1920×1080px (max 5 MB)."
          aspectClass="aspect-video"
        />
      </div>
    </EditorShell>
  );
}
