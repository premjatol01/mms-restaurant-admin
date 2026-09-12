import { useState, useEffect } from "react";
import { Plus, Search, QrCode, Grid3X3 } from "lucide-react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import TableForm from "./TableForm";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import AssignQRDialog from "./AssignQRDialog";
import TableDetailsDrawer from "./TableDetailsDrawer";

export default function TablesTab() {
  const { tables, qrCodes, updateTable } = useTablesQRStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTable, setEditTable] = useState(null);
  const [deleteTable, setDeleteTable] = useState(null);
  const [assignQR, setAssignQR] = useState(null);
  const [viewTable, setViewTable] = useState(null);

  const filteredTables = tables.filter((table) => {
    const matchSearch = !search || table.tableId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || table.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getQRInfo = (qrId) => qrCodes.find((qr) => qr.id === qrId);

  const handleToggleStatus = (table) => {
    const newStatus = table.status === "active" ? "inactive" : "active";
    updateTable(table.id, { status: newStatus });
    toast.success(`Table marked as ${newStatus}.`);
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
                <th className="text-left px-4 py-3 font-medium text-theme">Table ID</th>
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
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setViewTable(table)}
                        className="font-medium text-theme hover:text-primary hover:underline"
                      >
                        {table.tableId}
                      </button>
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
                      {qr ? (
                        <QRTypeBadge type={qr.type} />
                      ) : (
                        <span className="text-secondary">—</span>
                      )}
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
                        onEdit={() => { setEditTable(table); setShowForm(true); }}
                        onAssign={() => setAssignQR(table)}
                        onView={() => setViewTable(table)}
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
          message={`Are you sure you want to delete "${deleteTable.tableId}"? The table's QR association will also be removed.`}
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

      {viewTable && (
        <TableDetailsDrawer
          table={viewTable}
          qr={getQRInfo(viewTable.qrCodeId)}
          onClose={() => setViewTable(null)}
          onAssign={() => { setViewTable(null); setAssignQR(viewTable); }}
        />
      )}
    </div>
  );
}

function QRTypeBadge({ type }) {
  const colors = {
    default: "bg-blue-100 text-blue-700",
    premium: "bg-purple-100 text-purple-700",
    paid: "bg-amber-100 text-amber-700",
  };
  const labels = { default: "Default", premium: "Premium", paid: "Paid" };
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[type] || colors.default}`}>{labels[type]}</span>;
}

function TableActions({ table, qr, onEdit, onAssign, onView, onToggle, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-1.5 text-secondary hover:text-theme rounded hover:bg-primary-light">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-theme rounded-lg shadow-xl z-20 py-1">
            <button onClick={() => { onView(); setIsOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-theme hover:bg-primary-light"><Search size={14} /> View Details</button>
            <button onClick={() => { onEdit(); setIsOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-theme hover:bg-primary-light"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</button>
            {table.status === "active" && (
              <button onClick={() => { onAssign(); setIsOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-theme hover:bg-primary-light"><QrCode size={14} /> {qr ? "Change QR" : "Assign QR"}</button>
            )}
            <button onClick={() => { onToggle(); setIsOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-theme hover:bg-primary-light">{table.status === "active" ? "Mark Inactive" : "Mark Active"}</button>
            <button onClick={() => { onDelete(); setIsOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete</button>
          </div>
        </>
      )}
    </div>
  );
}