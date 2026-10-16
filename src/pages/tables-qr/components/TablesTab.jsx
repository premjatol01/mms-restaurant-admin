import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
import { defaultQRLayouts } from "../data/tablesQRData";
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
    const label = (table.tableNo || table.tableId || "").toLowerCase();
    const id = (table.tableId || "").toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !search || label.includes(q) || id.includes(q);
    const matchStatus = !statusFilter || table.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getQRInfo = (qrCodeId) => {
    if (!qrCodeId) return null;
    if (typeof qrCodeId === 'object') return qrCodeId; // Already populated
    return qrCodes.find((qr) => qr.id === qrCodeId || qr._id === qrCodeId);
  };

  // Every table that currently has a QR - this is what "Download All" exports
  const assignedPairs = getAssignedPairs(tables, qrCodes);

  const handleToggleStatus = async (table) => {
    const newStatus = table.status === "active" ? "inactive" : "active";
    try {
      await updateTable(table.id, { status: newStatus });
      toast.success(`Table marked as ${newStatus}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update table status.");
    }
  };

  const handleDownloadOne = async (table, qr) => {
    setDownloadingId(table.id);
    try {
      await downloadQRCode({ qr, table, url: qr.scanUrl || buildTableQRUrl({ table, qr }) });
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
      const items = assignedPairs.map(({ table, qr }) => ({ table, qr, url: qr.scanUrl || buildTableQRUrl({ table, qr }) }));
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
                <th className="text-right px-4 py-3 font-medium text-theme whitespace-nowrap min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTables.map((table) => {
                const qr = getQRInfo(table.qrCodeId);
                return (
                  <tr key={table.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10">
                    <td className="px-4 py-3 font-medium text-theme">
                      <span>{table.tableNo || table.tableId}</span>
                    </td>
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
                      {qr ? <QRTypeBadge templateId={qr.templateId} type={qr.type} /> : <span className="text-secondary">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">Inactive</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${table.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {table.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap min-w-[120px]">
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
          onConfirm={async () => {
            try {
              await useTablesQRStore.getState().deleteTable(deleteTable.id);
              toast.success("Table deleted successfully.");
            } catch (err) {
              toast.error(err.response?.data?.message || "Failed to delete table");
            } finally {
              setDeleteTable(null);
            }
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

function QRTypeBadge({ templateId, type }) {
  if (type === "standard" || !templateId) {
    return <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600 uppercase">Plain QR</span>;
  }
  const templates = useTablesQRStore.getState().qrTemplates || [];
  const layoutObj = templates.find((l) => l.id === templateId || l._id === templateId);
  const name = layoutObj ? layoutObj.name : "Template";
  return <span className="text-xs px-2 py-1 rounded-full font-medium bg-primary-light text-primary uppercase truncate max-w-[120px] inline-block">{name}</span>;
}

function TableActions({ table, qr, downloading, onEdit, onAssign, onDownload, onToggle, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = 220;
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceBelow < menuHeight && rect.top > menuHeight;
    const right = Math.max(8, window.innerWidth - rect.right);

    setMenuStyle({
      position: "fixed",
      ...(placeAbove
        ? { bottom: `${window.innerHeight - rect.top + 6}px` }
        : { top: `${rect.bottom + 6}px` }),
      right: `${right}px`,
      zIndex: 9999,
    });
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const itemClass =
    "w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-theme hover:bg-primary-light/40 transition-colors cursor-pointer text-left";

  const run = (action) => (e) => {
    e?.stopPropagation();
    action();
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      {qr && (
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading}
          title="Download QR code"
          className="p-1.5 text-secondary hover:text-primary hover:bg-primary-light/30 rounded transition-colors disabled:opacity-50"
        >
          {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        </button>
      )}

      <button
        type="button"
        onClick={onEdit}
        title="Edit table"
        className="p-1.5 text-secondary hover:text-theme hover:bg-primary-light/30 rounded transition-colors"
      >
        <Pencil size={16} />
      </button>

      <div className="relative inline-block">
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          title="More actions"
          aria-label={`Actions for ${table.tableNo || table.tableId}`}
          className={`p-1.5 rounded transition-colors ${
            isOpen
              ? "text-theme bg-primary-light/40"
              : "text-secondary hover:text-theme hover:bg-primary-light/30"
          }`}
        >
          <MoreVertical size={16} />
        </button>

        {isOpen &&
          createPortal(
            <div
              ref={menuRef}
              style={menuStyle}
              onClick={(e) => e.stopPropagation()}
              className="w-48 bg-surface border border-theme rounded-lg shadow-2xl py-1 text-left ring-1 ring-black/5"
            >
              <button type="button" onClick={run(onEdit)} className={itemClass}>
                <Pencil size={14} className="text-secondary" /> Edit Table
              </button>

              {table.status === "active" && (
                <button type="button" onClick={run(onAssign)} className={itemClass}>
                  <QrCode size={14} className="text-secondary" /> {qr ? "Change QR" : "Assign QR"}
                </button>
              )}

              {qr && (
                <button
                  type="button"
                  disabled={downloading}
                  onClick={run(onDownload)}
                  className={`${itemClass} disabled:opacity-50`}
                >
                  <Download size={14} className="text-secondary" /> Download QR
                </button>
              )}

              <button type="button" onClick={run(onToggle)} className={itemClass}>
                <ToggleRight size={14} className="text-secondary" />{" "}
                {table.status === "active" ? "Mark Inactive" : "Mark Active"}
              </button>

              <div className="my-1 border-t border-theme" />

              <button
                type="button"
                onClick={run(onDelete)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left"
              >
                <Trash2 size={14} /> Delete Table
              </button>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}
