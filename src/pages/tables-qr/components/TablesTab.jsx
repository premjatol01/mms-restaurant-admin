import { useState } from "react";
import { Plus, QrCode, Download, Loader2, MoreVertical, Pencil, Trash2, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import TableForm from "./TableForm";
import DeleteConfirmDialog from "../modals/DeleteConfirmDialog";
import AssignQRDialog from "../modals/AssignQRDialog";
import { QR_TYPE_META } from "../data/tablesQRData";
import { getAssignedPairs } from "../utils/qrRules";
import { buildTableQRUrl } from "../utils/qrLink";
import { downloadQRCode, downloadAllQRCodes } from "../utils/qrDownload";

export default function TablesTab() {
  const { tables, qrCodes, updateTable } = useTablesQRStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTable, setEditTable] = useState(null);
  const [deleteTable, setDeleteTable] = useState(null);
  const [assignQR, setAssignQR] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const filteredTables = tables.filter((table) => {
    const matchSearch = !search || table.tableId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || table.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getQRInfo = (qrId) => qrCodes.find((qr) => qr.id === qrId);

  // Every table that currently has a QR - this is what "Download All" exports
  const assignedPairs = getAssignedPairs(tables, qrCodes);

  const handleToggleStatus = (table) => {
    const newStatus = table.status === "active" ? "inactive" : "active";
    updateTable(table.id, { status: newStatus });
    toast.success(`Table marked as ${newStatus}.`);
  };

  const handleDownloadOne = async (table, qr) => {
    setDownloadingId(table.id);
    try {
      await downloadQRCode({ qr, table, url: buildTableQRUrl({ table, qr }) });
      toast.success(`${qr.name} downloaded.`);
    } catch (error) {
      console.error(error);
      toast.error("Couldn't generate the QR file. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAll = async () => {
    if (!assignedPairs.length) return;
    setDownloadingAll(true);
    try {
      const items = assignedPairs.map(({ table, qr }) => ({ table, qr, url: buildTableQRUrl({ table, qr }) }));
      const count = await downloadAllQRCodes(items);
      toast.success(`Downloaded ${count} QR ${count === 1 ? "code" : "codes"} as a ZIP file.`);
    } catch (error) {
      console.error(error);
      toast.error("Couldn't create the ZIP file. Please try again.");
    } finally {
      setDownloadingAll(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  const hasFilters = search || statusFilter;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search tables..." />
        </div>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          className="w-full sm:w-40"
        />
        <Button variant="secondary" disabled={!assignedPairs.length || downloadingAll} onClick={handleDownloadAll}>
          {downloadingAll ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {downloadingAll ? "Preparing ZIP..." : "Download All QR Codes"}
        </Button>
        <Button onClick={() => { setEditTable(null); setShowForm(true); }}>
          <Plus size={16} /> Add Table
        </Button>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary">Filtered results</span>
          <button onClick={clearFilters} className="text-sm text-primary hover:underline">Clear</button>
        </div>
      )}

      {!tables.length ? (
        <EmptyState
          title="No tables added yet"
          description="Add your restaurant tables and assign QR codes to start accepting table-based orders."
          actionLabel="+ Add Table"
          onAction={() => setShowForm(true)}
        />
      ) : filteredTables.length === 0 ? (
        <div className="p-8 text-center text-secondary">No tables match your filters.</div>
      ) : (
        <div className="overflow-x-auto border border-theme rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-primary-light/30 border-b border-theme">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-theme">Table No.</th>
                <th className="text-left px-4 py-3 font-medium text-theme">QR Code</th>
                <th className="text-left px-4 py-3 font-medium text-theme">QR Type</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Session</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Status</th>
                <th className="text-right px-4 py-3 font-medium text-theme">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTables.map((table) => {
                const qr = getQRInfo(table.qrCodeId);
                return (
                  <tr key={table.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10">
                    <td className="px-4 py-3 font-medium text-theme">{table.tableId}</td>
                    <td className="px-4 py-3">
                      {qr ? (
                        <span className="inline-flex items-center gap-1 text-theme">
                          <QrCode size={14} /> {qr.name}
                        </span>
                      ) : (
                        <span className="text-secondary">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {qr ? <QRTypeBadge type={qr.type} /> : <span className="text-secondary">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">Inactive</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${table.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {table.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <TableActions
                        table={table}
                        qr={qr}
                        downloading={downloadingId === table.id}
                        onEdit={() => { setEditTable(table); setShowForm(true); }}
                        onAssign={() => setAssignQR(table)}
                        onDownload={() => handleDownloadOne(table, qr)}
                        onToggle={() => handleToggleStatus(table)}
                        onDelete={() => setDeleteTable(table)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <TableForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTable(null); }}
        editTable={editTable}
      />

      {deleteTable && (
        <DeleteConfirmDialog
          title="Delete Table?"
          message={`Are you sure you want to delete "${deleteTable.tableId}"? Its QR code will be released and can be assigned to another table.`}
          onConfirm={() => {
            useTablesQRStore.getState().deleteTable(deleteTable.id);
            toast.success("Table deleted successfully.");
            setDeleteTable(null);
          }}
          onCancel={() => setDeleteTable(null)}
        />
      )}

      {assignQR && (
        <AssignQRDialog
          table={assignQR}
          onClose={() => setAssignQR(null)}
          onAssigned={() => setAssignQR(null)}
        />
      )}
    </div>
  );
}

function QRTypeBadge({ type }) {
  const meta = QR_TYPE_META[type] || QR_TYPE_META.default;
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${meta.className}`}>{meta.label}</span>;
}

function TableActions({ table, qr, downloading, onEdit, onAssign, onDownload, onToggle, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const itemClass = "w-full flex items-center gap-2 px-3 py-2 text-sm text-theme hover:bg-primary-light";
  const run = (action) => () => { action(); setIsOpen(false); };

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        aria-label={`Actions for ${table.tableId}`}
        className="p-1.5 text-secondary hover:text-theme rounded hover:bg-primary-light"
      >
        <MoreVertical size={18} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-theme rounded-lg shadow-xl z-20 py-1">
            <button onClick={run(onEdit)} className={itemClass}><Pencil size={14} /> Edit</button>
            {table.status === "active" && (
              <button onClick={run(onAssign)} className={itemClass}><QrCode size={14} /> {qr ? "Change QR" : "Assign QR"}</button>
            )}
            {qr && (
              <button disabled={downloading} onClick={run(onDownload)} className={`${itemClass} disabled:opacity-50`}>
                <Download size={14} /> Download QR
              </button>
            )}
            <button onClick={run(onToggle)} className={itemClass}>
              <ToggleRight size={14} /> {table.status === "active" ? "Mark Inactive" : "Mark Active"}
            </button>
            <button onClick={run(onDelete)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
