import Button from "../../../components/ui/Button";

export default function ConfirmModal({ title, message, confirmLabel = "Confirm", loading = false, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-base font-semibold text-theme mb-2">{title}</h3>
        <p className="text-sm text-secondary mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
