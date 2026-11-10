import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Plus, QrCode, Download, Loader2, MoreVertical, Pencil, Trash2, ToggleRight, Layers } from "lucide-react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import Pagination from "../../../components/ui/Pagination";
import TableForm from "./TableForm";
import DeleteConfirmDialog from "../modals/DeleteConfirmDialog";
import AssignQRDialog from "../modals/AssignQRDialog";
import BulkImportTablesModal from "../modals/BulkImportTablesModal";
import { formatTableName } from "../../../utils/formatTableName";
import { defaultQRLayouts } from "../data/tablesQRData";
import { getAssignedPairs } from "../utils/qrRules";
import { buildTableQRUrl } from "../utils/qrLink";
import { downloadQRCode, downloadAllQRCodes } from "../utils/qrDownload";

export default function TablesTab() {
  const { tables, qrCodes, updateTable } = useTablesQRStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTable, setEditTable] = useState(null);
  const [deleteTable, setDeleteTable] = useState(null);
  const [assignQR, setAssignQR] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Pagination State
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const formatted = formatTableName(table.tableNo || table.tableId || "").toLowerCase();
      const label = (table.tableNo || table.tableId || "").toLowerCase();
      const id = (table.tableId || "").toLowerCase();
      const q = search.toLowerCase();
      const matchSearch = !search || formatted.includes(q) || label.includes(q) || id.includes(q);
      const matchStatus = !statusFilter || table.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tables, search, statusFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [search, statusFilter]);

  const paginatedTables = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return filteredTables.slice(start, start + pagination.limit);
  }, [filteredTables, pagination]);

  const getQRInfo = (qrCodeId) => {
    if (!qrCodeId) return null;
    if (typeof qrCodeId === 'object' && (qrCodeId.imageUrl || qrCodeId.name)) return qrCodeId; // Fully populated
    const targetId = typeof qrCodeId === 'object' ? (qrCodeId.id || qrCodeId._id) : qrCodeId;
    return qrCodes.find((qr) => qr.id === targetId || qr._id === targetId);
  };

  // Every table that currently has a QR - this is what "Download All" exports
  const assignedPairs = useMemo(() => {
    return tables
      .map((table) => ({ table, qr: getQRInfo(table.qrCodeId) }))
      .filter(({ qr }) => Boolean(qr));
  }, [tables, qrCodes]);

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
      toast.success(`${table.tableNo || table.tableId || qr.name} downloaded.`);
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

  const handleApplyFilter = () => {
    setStatusFilter(draftStatus);
  };

  const clearFilters = () => {
    setSearch("");
    setDraftStatus("");
    setStatusFilter("");
  };

  const hasFilters = search || statusFilter;

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full">
      {/* Top Filter Bar */}
      <div className="flex-none mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search tables..." />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={draftStatus}
            onChange={setDraftStatus}
            options={[
              { value: "", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            className="w-full sm:w-40"
          />
          <Button variant="secondary" onClick={handleApplyFilter}>
            Apply
          </Button>
        </div>
        <Button variant="secondary" disabled={!assignedPairs.length || downloadingAll} onClick={handleDownloadAll}>
          {downloadingAll ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {downloadingAll ? "Preparing ZIP..." : "Download All QR Codes"}
        </Button>
        <Button variant="secondary" onClick={() => setShowBulkModal(true)}>
          <Layers size={16} /> Bulk Add Tables
        </Button>
        <Button onClick={() => { setEditTable(null); setShowForm(true); }}>
          <Plus size={16} /> Add Table
        </Button>
      </div>

      {hasFilters && (
        <div className="flex-none flex items-center gap-2 mb-3">
          <span className="text-xs text-secondary">Filtered: {filteredTables.length} tables found</span>
          <button onClick={clearFilters} className="text-xs text-primary hover:underline cursor-pointer">Clear filters</button>
        </div>
      )}

      {/* Main Full-Height Table Card */}
      {!tables.length ? (
        <div className="flex-1 min-h-0 flex items-center justify-center bg-surface border border-theme rounded-xl p-8">
          <EmptyState
            title="No tables added yet"
            description="Add your restaurant tables and assign QR codes to start accepting table-based orders."
            actionLabel="+ Add Table"
            onAction={() => setShowForm(true)}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col bg-surface border border-theme rounded-xl overflow-hidden shadow-sm">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead className="bg-primary-light/30 border-b border-theme sticky top-0 z-10 backdrop-blur-sm bg-surface/95">
                <tr>
                  <th className="text-left px-5 py-3.5 font-medium text-theme">Table No.</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">QR Code</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">QR Type</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Session</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Status</th>
                  <th className="text-right px-5 py-3.5 font-medium text-theme whitespace-nowrap min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTables.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-20 text-center text-secondary">
                      No tables match your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedTables.map((table) => {
                    const qr = getQRInfo(table.qrCodeId);
                    return (
                      <tr key={table.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-theme">
                          <span>{formatTableName(table.tableNo || table.tableId)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          {qr ? (
                            <span className="inline-flex items-center gap-1.5 text-theme font-medium">
                              <QrCode size={14} className="text-primary" /> {qr.name}
                            </span>
                          ) : (
                            <span className="text-secondary text-xs">Not Assigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {qr ? <QRTypeBadge templateId={qr.templateId} type={qr.type} /> : <span className="text-secondary">—</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium">Inactive</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${table.status === "active" ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                            {table.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap min-w-[120px]">
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
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pinned Bottom Pagination */}
          <Pagination
            pagination={pagination}
            totalItems={filteredTables.length}
            onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
            onLimitChange={(newLimit) => setPagination({ page: 1, limit: newLimit })}
            itemName="tables"
          />
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
          message={`Are you sure you want to delete "${formatTableName(deleteTable.tableNo || deleteTable.tableId)}"? Its QR code will be released and can be assigned to another table.`}
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

      <BulkImportTablesModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
      />

      {assignQR && (
        <AssignQRDialog
          table={assignQR}
          isOpen={Boolean(assignQR)}
          onClose={() => setAssignQR(null)}
        />
      )}
    </div>
  );
}

function QRTypeBadge({ templateId, type }) {
  if (type === "standard" || !templateId) {
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase">Plain QR</span>;
  }
  const templates = useTablesQRStore.getState().qrTemplates || [];
  const layoutObj = templates.find((l) => l.id === templateId || l._id === templateId);
  const name = layoutObj ? layoutObj.name : "Template";
  return <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-primary-light text-primary uppercase truncate max-w-[120px] inline-block">{name}</span>;
}

function TableActions({ table, qr, downloading, onEdit, onAssign, onDownload, onToggle, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = 220;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight + 10 && rect.top > menuHeight;

    setPosition({
      top: openUpward ? rect.top - menuHeight - 4 : rect.bottom + 4,
      right: Math.max(12, window.innerWidth - rect.right),
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
      if (triggerRef.current && triggerRef.current.contains(e.target)) {
        return;
      }
      const menuEl = document.getElementById(`table-actions-menu-${table.id}`);
      if (menuEl && !menuEl.contains(e.target)) {
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
  }, [isOpen, table.id]);

  const itemClass =
    "w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-theme hover:bg-primary-light/50 transition-colors cursor-pointer text-left";

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
          className="p-1.5 text-secondary hover:text-primary hover:bg-primary-light/40 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        </button>
      )}

      <button
        type="button"
        onClick={onEdit}
        title="Edit table"
        className="p-1.5 text-secondary hover:text-theme hover:bg-primary-light/40 rounded-lg transition-colors cursor-pointer"
      >
        <Pencil size={16} />
      </button>

      <div className="relative inline-block">
        <button
          ref={triggerRef}
          type="button"
          data-dropdown-trigger="true"
          onClick={handleToggle}
          title="More actions"
          aria-label={`Actions for ${table.tableNo || table.tableId}`}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isOpen
              ? "text-primary bg-primary-light"
              : "text-secondary hover:text-theme hover:bg-primary-light/40"
          }`}
        >
          <MoreVertical size={16} />
        </button>

        {isOpen &&
          createPortal(
            <div
              id={`table-actions-menu-${table.id}`}
              style={{
                position: "fixed",
                top: `${position.top}px`,
                right: `${position.right}px`,
                zIndex: 99999,
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-48 bg-surface border border-theme rounded-xl shadow-2xl py-1 text-left animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
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

              <div className="my-1 border-t border-theme/50" />

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