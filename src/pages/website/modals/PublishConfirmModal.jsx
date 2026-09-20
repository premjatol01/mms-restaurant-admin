import Button from "../../../components/ui/Button";
import Modal from "./Modal";

export default function PublishConfirmModal({ open, onClose, onConfirm, websiteUrl }) {
  return (
    <Modal open={open} onClose={onClose} label="Publish website">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-theme mb-2">Publish website?</h3>
        <p className="text-sm text-secondary mb-2">
          Your restaurant website will become available through your platform subdomain.
        </p>
        <code className="block text-sm text-theme bg-primary-soft px-2 py-1 rounded mb-6 break-all">
          {websiteUrl}
        </code>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>Publish</Button>
        </div>
      </div>
    </Modal>
  );
}
