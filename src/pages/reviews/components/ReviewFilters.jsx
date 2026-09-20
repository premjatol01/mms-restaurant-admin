import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";

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
  const hasFilters = Object.values(filters).some(Boolean);
  const invalidRange = !!filters.dateFrom && !!filters.dateTo && filters.dateFrom > filters.dateTo;

  return (
    <div className="bg-surface rounded-xl border border-theme p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Select
          label="Status"
          value={filters.status}
          onChange={(v) => onChange({ status: v })}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Rating"
          value={filters.rating}
          onChange={(v) => onChange({ rating: v })}
          options={RATING_OPTIONS}
        />
        <Input
          label="From"
          type="date"
          value={filters.dateFrom}
          max={filters.dateTo || undefined}
          onChange={(e) => onChange({ dateFrom: e.target.value })}
        />
        <Input
          label="To"
          type="date"
          value={filters.dateTo}
          min={filters.dateFrom || undefined}
          onChange={(e) => onChange({ dateTo: e.target.value })}
        />
      </div>

      {(invalidRange || hasFilters) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {invalidRange ? (
            <p className="text-sm text-red-500" role="alert">The start date must be on or before the end date.</p>
          ) : <span />}
          {hasFilters && (
            <button type="button" onClick={onClear} className="text-sm text-primary hover:underline">
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
