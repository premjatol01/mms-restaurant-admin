import { useEffect, useState, useMemo } from "react";
import { QrCode, Plus, Check, AlertCircle, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useProfileStore } from "../../../store/profileStore";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";
import Input from "../../../components/ui/Input";
import ConfirmModal from "../modals/ConfirmModal";

function SkeletonLoader() {
  return (
    <div className="animate-pulse bg-surface rounded-xl border border-theme p-6 space-y-4">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function TableConfigSection() {
  const { 
    tables, 
    tablesLoaded, 
    fetchTables, 
    createTables, 
    qrTemplates, 
    fetchQrTemplates,
    maxTables = 15,
    planName = "Basic"
  } = useProfileStore();

  const [saving, setSaving] = useState(false);
  const [count, setCount] = useState("");
  const [qrType, setQrType] = useState("normal"); // "normal" or templateId
  const [confirmModal, setConfirmModal] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => { 
    fetchTables(); 
    fetchQrTemplates();
  }, [fetchTables, fetchQrTemplates]);

  // Set default qrType: prefer first available template if any, else "normal"
  useEffect(() => {
    if (qrTemplates.length > 0 && qrType === "normal") {
      setQrType(qrTemplates[0]._id);
    }
  }, [qrTemplates]);

  const currentCount = tables.length;
  const remainingAllowed = Math.max(0, maxTables - currentCount);
  const nextNumber = tables.reduce((max, t) => {
    const n = parseInt((t.tableNo || t.tableId || "").replace(/\D/g, ""), 10);
    return !isNaN(n) ? Math.max(max, n) : max;
  }, 0) + 1;

  const parsed = Number(count);
  const countValid = Number.isInteger(parsed) && parsed >= 1 && parsed <= remainingAllowed;

  let countError = undefined;
  if (count !== "") {
    if (!Number.isInteger(parsed) || parsed < 1) {
      countError = "Please enter a whole number of at least 1.";
    } else if (parsed > remainingAllowed) {
      countError = `You can only add up to ${remainingAllowed} more tables on your ${planName} plan.`;
    }
  }

  // Selected QR type display name
  const selectedQrLabel = useMemo(() => {
    if (qrType === "normal") return "Normal Plain QR";
    const found = qrTemplates.find(t => t._id === qrType);
    return found ? `${found.name} Template` : "Normal Plain QR";
  }, [qrType, qrTemplates]);

  const handleCreate = async () => {
    setSaving(true);
    const result = await createTables({ count: parsed, qrType });
    setSaving(false);
    setConfirmModal(false);

    if (result.success) {
      toast.success(`${result.created} ${result.created === 1 ? "table" : "tables"} created with ${selectedQrLabel}!`);
      setCount("");
    } else {
      toast.error(result.message || "Failed to create tables.");
    }
  };

  if (!tablesLoaded) return <SkeletonLoader />;

  return (
    <div className="space-y-6">

      {/* ── Table & Subscription Summary ── */}
      <div className="bg-surface rounded-xl border border-theme p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-theme text-base">Table & QR Configuration</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-light/40 text-primary border border-primary/20">
                <ShieldCheck size={13} /> {planName} Plan
              </span>
            </div>
            <p className="text-xs text-secondary">
              Set your default QR code style and configure tables within your subscription limit.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-theme px-4 py-2.5 rounded-lg border border-theme shrink-0">
            <div>
              <p className="text-[11px] text-secondary font-medium">Configured</p>
              <p className="text-lg font-bold text-theme">{currentCount} <span className="text-xs font-normal text-secondary">/ {maxTables}</span></p>
            </div>
            <div className="h-8 w-px bg-theme" />
            <div>
              <p className="text-[11px] text-secondary font-medium">Available</p>
              <p className={`text-lg font-bold ${remainingAllowed > 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                {remainingAllowed}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                currentCount >= maxTables ? "bg-red-500" : "bg-primary"
              }`}
              style={{ width: `${Math.min(100, (currentCount / maxTables) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-secondary mt-1.5">
            <span>{currentCount} tables active</span>
            <span>Max {maxTables} tables allowed</span>
          </div>
        </div>
      </div>

      {/* ── 1. Select Default QR Template / Style (Small Size) ── */}
      <FormSection 
        title="1. Select Default QR Code Style" 
        description="Choose a custom branded QR standee template or a classic plain QR code for all your tables."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          
          {/* Normal QR Option Card */}
          <button
            type="button"
            onClick={() => setQrType("normal")}
            className={`relative rounded-xl p-2.5 text-center transition-all cursor-pointer border-2 flex flex-col items-center justify-between ${
              qrType === "normal"
                ? "border-primary bg-primary-light/15 shadow-sm ring-2 ring-primary/20"
                : "border-theme bg-surface hover:border-primary/50"
            }`}
          >
            {qrType === "normal" && (
              <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
            <div className="w-full h-24 rounded-lg bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-2 mb-2 border border-theme">
              <QrCode size={38} className="text-theme" />
              <span className="text-[10px] text-secondary mt-1 font-medium">Standard</span>
            </div>
            <div className="w-full">
              <p className="text-xs font-semibold text-theme truncate">Normal QR</p>
              <p className="text-[10px] text-secondary">Classic Plain</p>
            </div>
          </button>

          {/* QR Templates (Shown in compact small size) */}
          {qrTemplates.map((tpl) => {
            const isSelected = qrType === tpl._id;
            return (
              <button
                key={tpl._id}
                type="button"
                onClick={() => setQrType(tpl._id)}
                className={`relative rounded-xl p-2.5 text-center transition-all cursor-pointer border-2 flex flex-col items-center justify-between ${
                  isSelected
                    ? "border-primary bg-primary-light/15 shadow-sm ring-2 ring-primary/20"
                    : "border-theme bg-surface hover:border-primary/50"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow z-10">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
                
                {/* Small thumbnail */}
                <div className="w-full h-24 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden mb-2 border border-theme p-1">
                  {tpl.imagePath ? (
                    <img 
                      src={`${API_BASE}${tpl.imagePath}`} 
                      alt={tpl.name} 
                      className="max-h-full max-w-full object-contain rounded select-none"
                    />
                  ) : (
                    <QrCode size={32} className="text-secondary opacity-40" />
                  )}
                </div>

                <div className="w-full">
                  <p className="text-xs font-semibold text-theme truncate" title={tpl.name}>
                    {tpl.name}
                  </p>
                  <p className="text-[10px] text-primary font-medium">Branded Template</p>
                </div>
              </button>
            );
          })}
        </div>
      </FormSection>

      {/* ── 2. Add Table Numbers & Auto-Generate ── */}
      <FormSection
        title="2. Add Tables"
        description={remainingAllowed > 0
          ? `Enter how many tables to add. They will automatically be assigned your chosen QR style (${selectedQrLabel}) starting from Table ${nextNumber}.`
          : `You have reached the maximum of ${maxTables} tables allowed on your current plan.`}
      >
        {remainingAllowed <= 0 ? (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 text-sm flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Subscription Limit Reached ({maxTables} tables)</p>
              <p className="text-xs mt-0.5 text-amber-700 dark:text-amber-300">
                Your restaurant has configured all {maxTables} tables allowed on the {planName} plan. Upgrade your plan in the Subscription tab to add more tables.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-w-xs">
              <Input
                label="Number of tables to add"
                type="number"
                min="1"
                max={remainingAllowed}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                error={countError}
                placeholder={`e.g. ${Math.min(5, remainingAllowed)}`}
              />
              <p className="text-[11px] text-secondary mt-1">
                You can add up to <strong className="text-theme">{remainingAllowed}</strong> more tables.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button 
                type="button" 
                disabled={!countValid || remainingAllowed <= 0} 
                onClick={() => setConfirmModal(true)}
                className="flex items-center gap-2"
              >
                <Plus size={15} /> Add Tables with Default QR
              </Button>

              {currentCount > 0 && (
                <Link
                  to="/tables"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline px-3 py-2 rounded-lg hover:bg-primary-light/20 transition-colors"
                >
                  <ExternalLink size={13} />
                  View & Download QR Codes ({currentCount})
                </Link>
              )}
            </div>
          </div>
        )}
      </FormSection>

      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmModal
          title={`Add ${parsed} Tables?`}
          message={`This will add ${parsed} ${parsed === 1 ? "table" : "tables"} (numbered Table ${nextNumber} to Table ${nextNumber + parsed - 1}). Each table will automatically be generated with your selected ${selectedQrLabel}.`}
          confirmLabel={`Add ${parsed} Tables`}
          loading={saving}
          onConfirm={handleCreate}
          onCancel={() => setConfirmModal(false)}
        />
      )}
    </div>
  );
}
