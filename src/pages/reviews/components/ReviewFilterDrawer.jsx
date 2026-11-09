import { useState, useEffect } from "react";
import { Calendar, Filter, RotateCcw, AlertCircle } from "lucide-react";
import Drawer from "../../../components/ui/Drawer";
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
  { value: "5", label: "5 Stars (Excellent)" },
  { value: "4", label: "4 Stars (Very Good)" },
  { value: "3", label: "3 Stars (Good)" },
  { value: "2", label: "2 Stars (Fair)" },
  { value: "1", label: "1 Star (Poor)" },
];

const pad = (n) => String(n).padStart(2, "0");

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function ReviewFilterDrawer({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
}) {
  const [draftStatus, setDraftStatus] = useState(filters.status || "");
  const [draftRating, setDraftRating] = useState(filters.rating || "");
  const [draftDatePreset, setDraftDatePreset] = useState(filters.datePreset || "");
  const [draftDateFrom, setDraftDateFrom] = useState(filters.dateFrom || "");
  const [draftDateTo, setDraftDateTo] = useState(filters.dateTo || "");

  // Sync draft whenever drawer opens with current filters
  useEffect(() => {
    if (isOpen) {
      setDraftStatus(filters.status || "");
      setDraftRating(filters.rating || "");
      setDraftDatePreset(filters.datePreset || "");
      setDraftDateFrom(filters.dateFrom || "");
      setDraftDateTo(filters.dateTo || "");
    }
  }, [isOpen, filters]);

  // Validation: To Date cannot be lower than From Date
  const isInvalidDateRange = Boolean(
    draftDateFrom && draftDateTo && draftDateFrom > draftDateTo
  );

  const handleSelectPreset = (preset) => {
    setDraftDatePreset(preset);
    if (preset === "today") {
      const today = getTodayStr();
      setDraftDateFrom(today);
      setDraftDateTo(today);
    } else if (preset === "yesterday") {
      const yesterday = getYesterdayStr();
      setDraftDateFrom(yesterday);
      setDraftDateTo(yesterday);
    } else if (preset === "") {
      setDraftDateFrom("");
      setDraftDateTo("");
    }
  };

  const handleDateFromChange = (e) => {
    const val = e.target.value;
    setDraftDateFrom(val);

    // If a preset was active and custom date is changed, switch to custom or detect
    const today = getTodayStr();
    const yest = getYesterdayStr();
    if (val === today && draftDateTo === today) {
      setDraftDatePreset("today");
    } else if (val === yest && draftDateTo === yest) {
      setDraftDatePreset("yesterday");
    } else {
      setDraftDatePreset(val || draftDateTo ? "custom" : "");
    }

    // Auto-adjust "To" date if it's lower than the newly selected "From" date
    if (draftDateTo && val && val > draftDateTo) {
      setDraftDateTo(val);
    }
  };

  const handleDateToChange = (e) => {
    const val = e.target.value;
    setDraftDateTo(val);

    const today = getTodayStr();
    const yest = getYesterdayStr();
    if (draftDateFrom === today && val === today) {
      setDraftDatePreset("today");
    } else if (draftDateFrom === yest && val === yest) {
      setDraftDatePreset("yesterday");
    } else {
      setDraftDatePreset(draftDateFrom || val ? "custom" : "");
    }
  };

  const handleApply = () => {
    if (isInvalidDateRange) return;
    onApply({
      status: draftStatus,
      rating: draftRating,
      datePreset: draftDatePreset,
      dateFrom: draftDateFrom,
      dateTo: draftDateTo,
    });
    onClose();
  };

  const handleReset = () => {
    setDraftStatus("");
    setDraftRating("");
    setDraftDatePreset("");
    setDraftDateFrom("");
    setDraftDateTo("");
    onReset();
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Reviews"
      size="sm"
    >
      <div className="space-y-6">
        {/* Status Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-theme">
            Review Status
          </label>
          <Select
            value={draftStatus}
            onChange={setDraftStatus}
            options={STATUS_OPTIONS}
            className="w-full"
          />
        </div>

        {/* Rating Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-theme">
            Star Rating
          </label>
          <Select
            value={draftRating}
            onChange={setDraftRating}
            options={RATING_OPTIONS}
            className="w-full"
          />
        </div>

        {/* Date Filter & Presets */}
        <div className="space-y-3 pt-2 border-t border-theme/60">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-theme flex items-center gap-1.5">
              <Calendar size={15} className="text-primary" />
              Submission Date
            </label>
            {draftDatePreset && (
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                {draftDatePreset}
              </span>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: "", label: "All Dates" },
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "custom", label: "Custom" },
            ].map((p) => {
              const active = draftDatePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.id)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-soft border border-theme text-secondary hover:text-theme hover:bg-primary-light"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="space-y-1">
              <span className="text-xs text-secondary">From Date</span>
              <Input
                type="date"
                value={draftDateFrom}
                max={draftDateTo || undefined}
                onChange={handleDateFromChange}
                className="w-full text-xs"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-secondary">To Date</span>
              <Input
                type="date"
                value={draftDateTo}
                min={draftDateFrom || undefined}
                onChange={handleDateToChange}
                className="w-full text-xs"
              />
            </div>
          </div>

          {/* Validation Alert */}
          {isInvalidDateRange && (
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle size={14} className="shrink-0" />
              <span>The &quot;To&quot; date cannot be earlier than &quot;From&quot; date.</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-theme/60 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1 cursor-pointer"
            onClick={handleReset}
          >
            <RotateCcw size={15} className="mr-1.5" />
            Reset
          </Button>
          <Button
            className="flex-1 cursor-pointer"
            onClick={handleApply}
            disabled={isInvalidDateRange}
          >
            <Filter size={15} className="mr-1.5" />
            Apply Filters
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
