import { useState } from "react";
import { Plus, QrCode, Eye, Search, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import GenerateQRDrawer from "./GenerateQRDrawer";
import QRDetailsDrawer from "./QRDetailsDrawer";

const QR_TYPE_COLORS = { default: "bg-blue-100 text-blue-700", premium: "bg-purple-100 text-purple-700", paid: "bg-amber-100 text-amber-700" };
const QR_STATUS_COLORS = { available: "bg-green-100 text-green-700", assigned: "bg-purple-100 text-purple-700", inactive: "bg-gray-100 text-gray-500" };

export default function QRCodesTab() {
  const { qrCodes, tables, subscription } = useTablesQRStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [layoutFilter, setLayoutFilter] = useState("");
  const [showGenerate, setShowGenerate] = useState(false);
  const [viewQR, setViewQR] = useState(null);

  const filteredQRs = qrCodes.filter((qr) => {
    const matchSearch = !search || qr.name.toLowerCase().includes(search.toLowerCase()) || getTableName(qr.tableId)?.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || qr.type === typeFilter;
    const matchStatus = !statusFilter || qr.status === statusFilter;
    const matchLayout = !layoutFilter || qr.layout === layoutFilter;
    return matchSearch && matchType && matchStatus && matchLayout;
  });

  const getTableName = (tableId) => tables.find((t) => t.id === tableId)?.tableId;

  const totalQRs = qrCodes.length;
  const assignedQRs = qrCodes.filter((qr) => qr.status === "assigned").length;
  const availableQRs = qrCodes.filter((qr) => qr.status === "available").length;

  const clearFilters = () => { setSearch(""); setTypeFilter(""); setStatusFilter(""); setLayoutFilter(""); };
  const hasFilters = search || typeFilter || statusFilter || layoutFilter;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-theme rounded-lg p-4">
          <p className="text-sm text-secondary">Total QR Codes</p>
          <p className="text-2xl font-bold text-theme">{totalQRs}</p>
        </div>
        <div className="bg-surface border border-theme rounded-lg p-4">
          <p className="text-sm text-secondary">Assigned</p>
          <p className="text-2xl font-bold text-theme">{assignedQRs}</p>
        </div>
        <div className="bg-surface border border-theme rounded-lg p-4">
          <p className="text-sm text-secondary">Available</p>
          <p className="text-2xl font-bold text-theme">{availableQRs}</p>
        </div>
        <div className="bg-surface border border-theme rounded-lg p-4">
          <p className="text-sm text-secondary">Premium Available</p>
          <p className="text-2xl font-bold text-theme">{subscription.premiumQR.available}</p>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="bg-primary-light/20 rounded-lg p-4">
        <h4 className="font-medium text-theme mb-2">QR Availability</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-secondary">Default QR:</span> <span className="text-theme font-medium">Unlimited</span></div>
          <div><span className="text-secondary">Premium QR:</span> <span className="text-theme font-medium">{subscription.premiumQR.used}/{subscription.premiumQR.total} used</span></div>
          <div><span className="text-secondary">Additional QR:</span> <span className="text-theme font-medium">₹{subscription.paidQR.price} each</span></div>
        </div>
        {subscription.premiumQR.available > 0 && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(subscription.premiumQR.used / subscription.premiumQR.total) * 100}%` }} />
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search QR codes..." /></div>
        <Select value={typeFilter} onChange={setTypeFilter} options={[{ value: "", label: "All Types" }, { value: "default", label: "Default" }, { value: "premium", label: "Premium" }, { value: "paid", label: "Paid" }]} className="w-full sm:w-32" />
        <Select value={statusFilter} onChange={setStatusFilter} options={[{ value: "", label: "All Status" }, { value: "available", label: "Available" }, { value: "assigned", label: "Assigned" }, { value: "inactive", label: "Inactive" }]} className="w-full sm:w-32" />
        <Select value={layoutFilter} onChange={setLayoutFilter} options={[{ value: "", label: "All Layouts" }, { value: "classic", label: "Classic" }, { value: "modern", label: "Modern" }, { value: "elegant", label: "Elegant" }]} className="w-full sm:w-32" />
        <Button onClick={() => setShowGenerate(true)}><Plus size={16} /> Generate QR</Button>
      </div>

      {hasFilters && <button onClick={clearFilters} className="text-sm text-primary hover:underline">Clear filters</button>}

      {!qrCodes.length ? (
        <EmptyState title="No QR codes yet" description="Generate a QR code and assign it to a restaurant table." actionLabel="+ Generate QR" onAction={() => setShowGenerate(true)} />
      ) : filteredQRs.length === 0 ? (
        <div className="p-8 text-center text-secondary">No QR codes match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQRs.map((qr) => (
            <div key={qr.id} className="bg-surface border border-theme rounded-lg overflow-hidden">
              <div className="bg-white p-4 flex justify-center">
                <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                  <QrCode size={40} className="text-gray-400" />
                </div>
              </div>
              <div className="p-4 border-t border-theme">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-theme">{qr.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${QR_TYPE_COLORS[qr.type]}`}>{qr.type}</span>
                </div>
                <p className="text-sm text-secondary capitalize mb-2">Layout: {qr.layout}</p>
                <p className="text-sm text-secondary mb-3">Assigned: {getTableName(qr.tableId) || "—"}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${QR_STATUS_COLORS[qr.status]}`}>{qr.status}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setViewQR(qr)} className="p-1.5 text-secondary hover:text-theme rounded hover:bg-primary-light"><Eye size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showGenerate && <GenerateQRDrawer isOpen={showGenerate} onClose={() => setShowGenerate(false)} />}
      {viewQR && <QRDetailsDrawer qr={viewQR} onClose={() => setViewQR(null)} />}
    </div>
  );
}