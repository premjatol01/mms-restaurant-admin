import { useState, useEffect } from "react";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const RATING_OPTIONS = [
  { value: "", label: "All Ratings" },
  { value: "5", label: "5 Stars" },
  { value: "4", label: "4 Stars" },
  { value: "3", label: "3 Stars" },
  { value: "2", label: "2 Stars" },
  { value: "1", label: "1 Star" },
];

export default function ReviewFilters({ filters, onChange, onClear }) {
  const [draft, setDraft] = useState(filters);

  // Sync draft if external filters change (e.g. cleared)
  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const hasActiveFilters = Object.values(filters).some(Boolean);
  const invalidRange = !!draft.dateFrom && !!draft.dateTo && draft.dateFrom > draft.dateTo;

  const handleApply = () => {
    if (invalidRange) return;
    onChange(draft);
  };

  const handleReset = () => {
    const cleared = { status: "", rating: "", dateFrom: "", dateTo: "" };
    setDraft(cleared);
    onClear();
  };

  return (
    <div className="bg-surface rounded-xl border border-theme p-4 space-y-3 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Select
          label="Status"
          value={draft.status || ""}
          onChange={(v) => setDraft((prev) => ({ ...prev, status: v }))}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Rating"
          value={draft.rating || ""}
          onChange={(v) => setDraft((prev) => ({ ...prev, rating: v }))}
          options={RATING_OPTIONS}
        />
        <Input
          label="From"
          type="date"
          value={draft.dateFrom || ""}
          max={draft.dateTo || undefined}
          onChange={(e) => setDraft((prev) => ({ ...prev, dateFrom: e.target.value }))}
        />
        <Input
          label="To"
          type="date"
          value={draft.dateTo || ""}
          min={draft.dateFrom || undefined}
          onChange={(e) => setDraft((prev) => ({ ...prev, dateTo: e.target.value }))}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-theme/60">
        <div>
          {invalidRange ? (
            <p className="text-xs text-red-500" role="alert">The start date must be on or before the end date.</p>
          ) : hasActiveFilters ? (
            <span className="text-xs text-secondary">Filters currently applied</span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="secondary" size="sm" onClick={handleReset}>
              Clear
            </Button>
          )}
          <Button size="sm" onClick={handleApply} disabled={invalidRange}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
