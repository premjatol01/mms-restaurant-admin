import { useState } from "react";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import EditorShell from "../shared/EditorShell";

export default function OffersEditor({ section, onSave, onCancel }) {
  const [content, setContent] = useState(section.content);

  return (
    <EditorShell
      title="Offers Section"
      description="Offers are sourced from your Offers & Promotions"
      onBack={onCancel}
      onSave={() => onSave(content)}
    >
      <Input
        label="Section Title"
        value={content.title}
        onChange={(e) => setContent((c) => ({ ...c, title: e.target.value }))}
        placeholder="Special Offers"
      />
      <Textarea
        label="Description"
        value={content.description}
        onChange={(e) => setContent((c) => ({ ...c, description: e.target.value }))}
        placeholder="Check out our latest deals..."
        rows={3}
      />
    </EditorShell>
  );
}
