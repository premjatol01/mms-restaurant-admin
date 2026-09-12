import { Plus } from "lucide-react";
import Button from "./Button";

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mb-4">
        <Plus size={24} className="text-primary" />
      </div>
      <h3 className="text-lg font-medium text-theme mb-2">{title}</h3>
      <p className="text-sm text-secondary mb-6 max-w-sm">{description}</p>
      {onAction && (
        <Button onClick={onAction}>
          <Plus size={16} /> {actionLabel}
        </Button>
      )}
    </div>
  );
}