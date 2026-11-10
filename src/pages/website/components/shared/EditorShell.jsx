import { ArrowLeft } from "lucide-react";
import Button from "../../../../components/ui/Button";

// Common frame for every section editor: back link, title, content and Cancel / Save actions.
export default function EditorShell({ title, description, onBack, onSave, children }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 mt-0.5 text-secondary hover-text-primary hover-bg-primary-soft rounded"
          title="Back to sections"
          aria-label="Back to sections"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h3 className="font-semibold text-theme">{title}</h3>
          {description && <p className="text-xs text-secondary">{description}</p>}
        </div>
      </div>

      <div className="space-y-4">{children}</div>

      <div className="flex justify-end gap-2 pt-4 border-t border-theme">
        <Button variant="secondary" onClick={onBack}>Cancel</Button>
        <Button onClick={onSave}>Save changes</Button>
      </div>
    </div>
  );
}
