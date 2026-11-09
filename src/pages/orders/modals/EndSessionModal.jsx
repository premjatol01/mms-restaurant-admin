import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useOrdersStore } from "../../../store/ordersStore";
import Button from "../../../components/ui/Button";

export default function EndSessionModal({ session, isOpen, onClose }) {
  const endSession = useOrdersStore((state) => state.endSession);
  const getTableName = useOrdersStore((state) => state.getTableName);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !session) return null;

  const tableName = getTableName(session.tableId);

  const handleConfirmEnd = async () => {
    setLoading(true);
    try {
      const res = await endSession(session.id);
      if (res?.ok) {
        toast.success(`Session ended for ${tableName}. Table is now free!`);
        onClose();
      } else {
        toast.error(res?.message || "Failed to end session.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to end session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-md rounded-2xl border border-theme shadow-xl overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-theme">End Table Session?</h3>
            <p className="text-sm font-semibold text-primary">{tableName} · #{session.sessionNumber}</p>
          </div>

          <p className="text-xs text-secondary leading-relaxed max-w-sm mx-auto">
            This will complete the session, free up <strong>{tableName}</strong> for new customer QR orders, and close any open items without requiring payment collection.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Keep Session
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmEnd}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Ending..." : "Yes, End Session"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
