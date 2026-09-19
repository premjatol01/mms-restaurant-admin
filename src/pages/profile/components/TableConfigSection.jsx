import { useEffect, useState } from "react";
import { Copy, ExternalLink, Lock, Plus, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "../../../store/profileStore";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";
import Input from "../../../components/ui/Input";
import ConfirmModal from "../modals/ConfirmModal";

const MAX_PER_BATCH = 100;

const FILTERS = [
  { id: "all", label: "All" },
  { id: "assigned", label: "With QR" },
  { id: "unassigned", label: "Without QR" },
];

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-theme bg-theme px-4 py-3">
      <p className="text-xs text-secondary">{label}</p>
      <p className="text-xl font-bold text-theme">{value}</p>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse bg-surface rounded-xl border border-theme p-6 space-y-3">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />)}
      </div>
    </div>
  );
}

export default function TableConfigSection() {
  const { tables, tablesLoaded, fetchTables, createTables, assignTableQr, assignAllTableQr } = useProfileStore();

  const [saving, setSaving] = useState(false);
  const [count, setCount] = useState("");
  const [assignNow, setAssignNow] = useState(true);
  const [filter, setFilter] = useState("all");
  const [confirm, setConfirm] = useState(null); // { type: "create", count } | { type: "assignAll" }
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const hasTables = tables.length > 0;
  const withQr = tables.filter((t) => t.qrCode);
  const withoutQr = tables.filter((t) => !t.qrCode);
  const nextNumber = tables.reduce((max, t) => Math.max(max, t.number), 0) + 1;

  const parsed = Number(count);
  const countValid = Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_PER_BATCH;
  const countError = count !== "" && !countValid ? `Enter a whole number from 1 to ${MAX_PER_BATCH}.` : undefined;

  const visibleTables = tables.filter((t) =>
    filter === "assigned" ? t.qrCode : filter === "unassigned" ? !t.qrCode : true
  );

  const handleConfirm = async () => {
    setSaving(true);
    if (confirm.type === "create") {
      const result = await createTables({ count: confirm.count, assignQr: assignNow });
      if (result.success) {
        toast.success(`${result.created} ${result.created === 1 ? "table" : "tables"} added.`);
        setCount("");
      } else {
        toast.error(result.message);
      }
    } else {
      const result = await assignAllTableQr();
      if (result.success) toast.success(`QR codes assigned to ${result.assigned} ${result.assigned === 1 ? "table" : "tables"}.`);
      else toast.error(result.message);
    }
    setSaving(false);
    setConfirm(null);
  };

  const handleAssignOne = async (table) => {
    setAssigningId(table.id);
    const result = await assignTableQr(table.id);
    setAssigningId(null);
    if (result.success) toast.success(`QR code assigned to ${table.label}.`);
    else toast.error(result.message);
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("QR link copied to clipboard.");
  };

  if (!tablesLoaded) return <SkeletonLoader />;

  return (
    <div className="space-y-5">
      {hasTables && (
        <FormSection title="Table Overview" description="Each table has its own QR code that customers scan to order.">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Total tables" value={tables.length} />
            <Stat label="With QR code" value={withQr.length} />
            <Stat label="Without QR code" value={withoutQr.length} />
          </div>
        </FormSection>
      )}

      <FormSection
        title={hasTables ? "Add More Tables" : "Set Up Tables"}
        description={hasTables
          ? `New tables are numbered from Table ${nextNumber}.`
          : "Enter how many tables your restaurant has. You can add more later."}
      >
        <div className="space-y-4">
          <div className="max-w-xs">
            <Input
              label={hasTables ? "Number of tables to add" : "Number of tables"}
              type="number"
              min="1"
              max={MAX_PER_BATCH}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              error={countError}
              placeholder="e.g. 12"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={assignNow}
              onChange={(e) => setAssignNow(e.target.checked)}
              className="w-4 h-4 accent-[var(--color-primary)]"
            />
            <span className="text-sm text-theme">Assign QR codes to the new tables now</span>
          </label>

          {hasTables && (
            <div className="flex items-start gap-2 text-xs text-secondary">
              <Lock size={13} className="mt-0.5 flex-shrink-0" />
              <p>Adding tables never changes your existing tables or their QR codes.</p>
            </div>
          )}

          <div>
            <Button type="button" disabled={!countValid} onClick={() => setConfirm({ type: "create", count: parsed })}>
              <Plus size={14} /> {hasTables ? "Add Tables" : "Create Tables"}
            </Button>
          </div>
        </div>
      </FormSection>

      {hasTables && (
        <FormSection title="Tables & QR Codes" description="A QR code stays with its table once it's assigned.">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="inline-flex rounded-lg border border-theme overflow-hidden w-fit">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  aria-pressed={filter === f.id}
                  className={`px-3 py-1.5 text-xs transition-colors border-r border-theme last:border-0 ${filter === f.id ? "bg-primary text-white font-medium" : "text-theme hover:bg-theme"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {withoutQr.length > 0 && (
              <Button type="button" variant="secondary" size="sm" onClick={() => setConfirm({ type: "assignAll" })}>
                <QrCode size={14} /> Assign QR to {withoutQr.length} {withoutQr.length === 1 ? "table" : "tables"}
              </Button>
            )}
          </div>

          {visibleTables.length === 0 ? (
            <p className="text-sm text-secondary text-center py-8">No tables match this filter.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {visibleTables.map((table) => (
                <div key={table.id} className="rounded-lg border border-theme bg-theme p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-theme">{table.label}</span>
                    {table.qrCode && (
                      <span title="QR code is locked to this table" className="text-secondary">
                        <Lock size={13} />
                      </span>
                    )}
                  </div>

                  {table.qrCode ? (
                    <div className="flex items-center gap-1.5">
                      <QrCode size={14} className="text-green-600 flex-shrink-0" />
                      <span className="text-xs text-secondary truncate flex-1">{table.qrCode.code}</span>
                      {table.qrCode.url && (
                        <>
                          <button type="button" onClick={() => copyLink(table.qrCode.url)} title="Copy QR link" aria-label={`Copy QR link for ${table.label}`} className="text-secondary hover:text-theme transition-colors">
                            <Copy size={14} />
                          </button>
                          <a href={table.qrCode.url} target="_blank" rel="noopener noreferrer" title="Open QR link" aria-label={`Open QR link for ${table.label}`} className="text-secondary hover:text-theme transition-colors">
                            <ExternalLink size={14} />
                          </a>
                        </>
                      )}
                    </div>
                  ) : (
                    <Button type="button" variant="secondary" size="sm" loading={assigningId === table.id} onClick={() => handleAssignOne(table)}>
                      <QrCode size={14} /> Assign QR
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </FormSection>
      )}

      {confirm?.type === "create" && (
        <ConfirmModal
          title={hasTables ? "Add tables?" : "Create tables?"}
          message={`This adds ${confirm.count} ${confirm.count === 1 ? "table" : "tables"}${hasTables ? ` (Table ${nextNumber} onwards)` : ""}${assignNow ? " and assigns a QR code to each" : ""}. Existing tables and QR codes stay as they are.`}
          confirmLabel={hasTables ? "Add Tables" : "Create Tables"}
          loading={saving}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.type === "assignAll" && (
        <ConfirmModal
          title="Assign QR codes?"
          message={`This assigns a QR code to ${withoutQr.length} ${withoutQr.length === 1 ? "table" : "tables"} that don't have one. Tables that already have a QR code are not changed.`}
          confirmLabel="Assign QR Codes"
          loading={saving}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
