import { TriangleAlert } from "lucide-react";
import Button from "../../../components/ui/Button";
import Modal from "./Modal";

// Shown when the subdomain is changed while the website is published.
export default function SubdomainConfirmModal({ open, onClose, onConfirm, oldUrl, newUrl }) {
  return (
    <Modal open={open} onClose={onClose} label="Change website address">
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-100 text-amber-600 shrink-0">
            <TriangleAlert size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-theme">Change website address?</h3>
            <p className="text-sm text-secondary mt-1">
              Your website is published. After this change, the old link stops working and anyone using it will not reach your website.
            </p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-xs text-secondary">Current address</p>
            <code className="block text-theme line-through opacity-70 break-all">{oldUrl}</code>
          </div>
          <div>
            <p className="text-xs text-secondary">New address</p>
            <code className="block text-theme bg-primary-soft px-2 py-1 rounded break-all">{newUrl}</code>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Keep current address</Button>
          <Button onClick={onConfirm}>Change address</Button>
        </div>
      </div>
    </Modal>
  );
}
