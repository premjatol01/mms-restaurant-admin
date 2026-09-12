import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "../../../store/profileStore";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function TimeSlot({ slot, onChange, onRemove, canRemove }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="time"
        value={slot.open}
        onChange={(e) => onChange({ ...slot, open: e.target.value })}
        className="px-2 py-1.5 rounded-lg border border-theme bg-surface text-sm text-theme focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
      />
      <span className="text-secondary text-sm">–</span>
      <input
        type="time"
        value={slot.close}
        onChange={(e) => onChange({ ...slot, close: e.target.value })}
        className="px-2 py-1.5 rounded-lg border border-theme bg-surface text-sm text-theme focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
      />
      {canRemove && (
        <button type="button" onClick={onRemove} className="text-secondary hover:text-red-500 transition-colors">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default function BusinessHoursForm() {
  const { profile, saveProfile, updateProfile, saving } = useProfileStore();
  const [hours, setHours] = useState(profile?.businessHours || []);

  useEffect(() => { if (profile?.businessHours) setHours(profile.businessHours); }, [profile]);

  const toggleDay = (idx) => {
    setHours((prev) => prev.map((d, i) => i === idx ? { ...d, isOpen: !d.isOpen } : d));
  };

  const updateSlot = (dayIdx, slotIdx, slot) => {
    setHours((prev) => prev.map((d, i) => i === dayIdx ? { ...d, slots: d.slots.map((s, j) => j === slotIdx ? slot : s) } : d));
  };

  const addSlot = (dayIdx) => {
    setHours((prev) => prev.map((d, i) => i === dayIdx ? { ...d, slots: [...d.slots, { open: "10:00", close: "23:00" }] } : d));
  };

  const removeSlot = (dayIdx, slotIdx) => {
    setHours((prev) => prev.map((d, i) => i === dayIdx ? { ...d, slots: d.slots.filter((_, j) => j !== slotIdx) } : d));
  };

  const onSave = async () => {
    updateProfile({ businessHours: hours });
    const result = await saveProfile({ businessHours: hours });
    if (result.success) toast.success("Business hours updated.");
    else toast.error(result.message);
  };

  return (
    <div className="space-y-5">
      <FormSection title="Business Hours" description="Set your weekly operating schedule.">
        <div className="space-y-4">
          {hours.map((day, dayIdx) => (
            <div key={day.day} className="flex flex-col sm:flex-row sm:items-start gap-3 py-3 border-b border-theme last:border-0">
              <div className="flex items-center gap-3 min-w-[140px]">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={day.isOpen} onChange={() => toggleDay(dayIdx)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-checked:bg-[var(--color-primary)] rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-4" />
                </label>
                <span className="text-sm font-medium text-theme w-24">{day.day}</span>
              </div>

              {day.isOpen ? (
                <div className="flex flex-col gap-2 flex-1">
                  {day.slots.map((slot, slotIdx) => (
                    <TimeSlot
                      key={slotIdx}
                      slot={slot}
                      onChange={(s) => updateSlot(dayIdx, slotIdx, s)}
                      onRemove={() => removeSlot(dayIdx, slotIdx)}
                      canRemove={day.slots.length > 1}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => addSlot(dayIdx)}
                    className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline w-fit"
                  >
                    <Plus size={12} /> Add Time Slot
                  </button>
                </div>
              ) : (
                <span className="text-sm text-secondary self-center">Closed</span>
              )}
            </div>
          ))}
        </div>
      </FormSection>
      <div className="flex justify-end">
        <Button type="button" onClick={onSave} loading={saving}>Save Changes</Button>
      </div>
    </div>
  );
}