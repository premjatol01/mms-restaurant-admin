import Button from "../../../components/ui/Button";

export default function UnsavedChangesModal({ onStay, onLeave }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-base font-semibold text-theme mb-2">Unsaved Changes</h3>
        <p className="text-sm text-secondary mb-5">You have unsaved changes that haven't been saved. Are you sure you want to leave?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onStay}>Stay</Button>
          <Button variant="danger" onClick={onLeave}>Leave</Button>
        </div>
      </div>
    </div>
  );
}