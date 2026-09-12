import { AlertTriangle, Check, X } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function DeleteConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = "Delete" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-surface rounded-xl border border-theme w-full max-w-md p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-theme">{title}</h3>
            <p className="text-sm text-secondary mt-2">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" className="flex-1" onClick={onCancel}><X size={16} /> Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm}><Check size={16} /> {confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}