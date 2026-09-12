import { X, QrCode, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import Button from "../../../components/ui/Button";

export default function TableDetailsDrawer({ table, qr, onClose, onAssign }) {
  const { unassignQR } = useTablesQRStore();
  const [showQRPreview, setShowQRPreview] = useState(false);

  const handleUnassign = () => {
    if (qr) {
      unassignQR(qr.id);
      toast.success("QR code unassigned successfully.");
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-surface w-full max-w-md h-full flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
            <h2 className="text-lg font-semibold text-theme">{table.tableId}</h2>
            <button onClick={onClose} className="p-1 text-secondary hover:text-theme rounded"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary">Status</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${table.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {table.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">QR Code</span>
                {qr ? <span className="text-theme font-medium">{qr.name}</span> : <span className="text-secondary">Not Assigned</span>}
              </div>
              {qr && (
                <>
                  <div className="flex justify-between">
                    <span className="text-secondary">QR Type</span>
                    <QRTypeBadge type={qr.type} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">QR Layout</span>
                    <span className="text-theme capitalize">{qr.layout}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">QR Status</span>
                    <span className="text-theme capitalize">{qr.status}</span>
                  </div>
                </>
              )}
            </div>

            {qr && (
              <div className="border border-theme rounded-lg p-4">
                <div className="bg-white p-4 rounded-lg mb-3 flex justify-center">
                  <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center">
                    <QrCode size={48} className="text-gray-400" />
                  </div>
                </div>
                <p className="text-center text-sm text-secondary">{qr.name}</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => setShowQRPreview(true)}>
                    <Eye size={14} /> View
                  </Button>
                  {table.status === "active" && (
                    <Button variant="secondary" size="sm" className="flex-1" onClick={onAssign}>
                      Change
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t border-theme flex gap-3">
            {table.status === "active" && !qr && (
              <Button className="flex-1" onClick={onAssign}><QrCode size={16} /> Assign QR</Button>
            )}
            {qr && table.status === "active" && (
              <Button variant="secondary" className="flex-1" onClick={handleUnassign}>Unassign QR</Button>
            )}
            {table.status === "inactive" && <span className="text-sm text-secondary">Table is inactive</span>}
          </div>
        </div>
      </div>

      {showQRPreview && qr && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowQRPreview(false)} />
          <div className="relative bg-surface rounded-xl border border-theme w-full max-w-sm p-6">
            <div className="text-center">
              <div className="bg-white p-6 rounded-lg mb-4 inline-block">
                <div className="w-40 h-40 bg-gray-100 rounded flex items-center justify-center">
                  <QrCode size={64} className="text-gray-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-theme">{qr.name}</h3>
              <p className="text-sm text-secondary mt-1">Type: {qr.type} | Layout: {qr.layout}</p>
              <p className="text-sm text-secondary">Table: {table.tableId}</p>
              <p className="text-sm text-secondary">Status: {qr.status}</p>
              <div className="flex gap-2 mt-4 justify-center">
                <Button variant="secondary" size="sm" onClick={() => {}}><Download size={14} /> Download</Button>
                <Button size="sm" onClick={() => setShowQRPreview(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function QRTypeBadge({ type }) {
  const colors = { default: "bg-blue-100 text-blue-700", premium: "bg-purple-100 text-purple-700", paid: "bg-amber-100 text-amber-700" };
  const labels = { default: "Default", premium: "Premium", paid: "Paid" };
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[type] || colors.default}`}>{labels[type]}</span>;
}