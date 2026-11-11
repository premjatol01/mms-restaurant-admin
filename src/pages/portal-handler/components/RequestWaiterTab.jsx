import React, { useState } from "react";
import { Bell, Plus, Trash2, Clock, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { usePortalHandlerStore } from "../../../store/portalHandlerStore";
import Button from "../../../components/ui/Button";

export default function RequestWaiterTab() {
  const {
    portalData,
    addWaiterOption,
    removeWaiterOption,
    updateWaiterText,
    updateWaiterTime,
    toggleWaiterMaster,
  } = usePortalHandlerStore();

  const { waiterRequest } = portalData;
  const [newOptionLabel, setNewOptionLabel] = useState("");

  const handleAddOption = (e) => {
    e.preventDefault();
    if (!newOptionLabel.trim()) {
      toast.error("Please enter an option name");
      return;
    }
    addWaiterOption(newOptionLabel.trim());
    setNewOptionLabel("");
  };

  return (
    <div className="bg-surface rounded-xl border border-theme p-5 space-y-6">
      {/* Header & Feature Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-theme">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-theme">
              Request Waiter Handler
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Configure table assistance options, customer message, and cooldown time.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleWaiterMaster()}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
            waiterRequest.enabled
              ? "bg-green-600 border-green-700 text-white hover:bg-green-700"
              : "bg-surface-soft border-theme text-theme hover:bg-gray-200"
          }`}
        >
          {waiterRequest.enabled ? "Feature Enabled" : "Feature Disabled"}
        </button>
      </div>

      {/* 1. Request Options (Add Options & List Options) */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-theme">
          Service Request Options ({(waiterRequest.options || []).length})
        </h4>

        {/* Add Option Input */}
        <form onSubmit={handleAddOption} className="flex gap-2 max-w-lg">
          <input
            type="text"
            value={newOptionLabel}
            onChange={(e) => setNewOptionLabel(e.target.value)}
            placeholder="Type option name (e.g. Water Refill, Extra Cutlery)..."
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
          />
          <Button variant="primary" size="sm" icon={Plus} type="submit">
            Add Option
          </Button>
        </form>

        {/* Options List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {(waiterRequest.options || []).map((option) => (
            <div
              key={option.id}
              className="p-3 rounded-xl border border-theme bg-surface-soft flex items-center justify-between gap-2 shadow-2xs"
            >
              <span className="text-xs font-semibold text-theme truncate">
                {option.label}
              </span>
              <button
                type="button"
                onClick={() => removeWaiterOption(option.id)}
                title="Remove option"
                className="p-1 rounded text-secondary hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Customer Notification Text & 3. Cooldown Time */}
      <div className="pt-4 border-t border-theme grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Customer Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-theme flex items-center gap-1.5">
            <MessageSquare size={14} className="text-primary" />
            <span>Customer Instruction / Reassurance Text</span>
          </label>
          <input
            type="text"
            value={waiterRequest.instructionsText || ""}
            onChange={(e) => updateWaiterText(e.target.value)}
            placeholder="e.g. A service captain has been notified and is heading to your table."
            className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
          />
          <p className="text-[11px] text-secondary">
            Message displayed to customer after they request assistance.
          </p>
        </div>

        {/* Cooldown Time */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-theme flex items-center gap-1.5">
            <Clock size={14} className="text-primary" />
            <span>Spam Cooldown Interval</span>
          </label>
          <select
            value={waiterRequest.cooldownMinutes || 2}
            onChange={(e) => updateWaiterTime(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-theme bg-surface text-theme focus:outline-none focus:border-primary"
          >
            <option value={1}>1 Minute between requests</option>
            <option value={2}>2 Minutes between requests</option>
            <option value={3}>3 Minutes between requests</option>
            <option value={5}>5 Minutes between requests</option>
          </select>
          <p className="text-[11px] text-secondary">
            Minimum waiting period before the same table can call staff again.
          </p>
        </div>
      </div>
    </div>
  );
}
