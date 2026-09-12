import { AlertTriangle, Check, X } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = "Confirm" }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-surface rounded-xl border border-theme w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-theme">{title}</h3>
            <p className="text-sm text-secondary mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onCancel}><X size={14} /> Cancel</Button>
          <Button className="flex-1" onClick={onConfirm}><Check size={14} /> {confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}