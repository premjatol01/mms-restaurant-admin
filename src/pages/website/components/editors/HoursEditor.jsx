import { useState } from "react";
import { Plus, X, Clock } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import EditorShell from "../shared/EditorShell";
import FormBlock from "../shared/FormBlock";
import { useProfileStore } from "../../../../store/profileStore";

const DEFAULT_BUSINESS_HOURS = [
  { day: "Monday", isOpen: true, slots: [{ open: "10:00", close: "23:00" }] },
  { day: "Tuesday", isOpen: true, slots: [{ open: "10:00", close: "23:00" }] },
  { day: "Wednesday", isOpen: true, slots: [{ open: "10:00", close: "23:00" }] },
  { day: "Thursday", isOpen: true, slots: [{ open: "10:00", close: "23:00" }] },
  { day: "Friday", isOpen: true, slots: [{ open: "10:00", close: "23:00" }] },
  { day: "Saturday", isOpen: true, slots: [{ open: "10:00", close: "23:00" }] },
  { day: "Sunday", isOpen: true, slots: [{ open: "10:00", close: "23:00" }] },
];

function TimeSlot({ slot, onChange, onRemove, canRemove }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="time"
        value={slot.open}
        onChange={(e) => onChange({ ...slot, open: e.target.value })}
        className="px-2.5 py-1.5 rounded-lg border border-theme bg-surface text-xs text-theme focus:outline-none focus:ring-1 focus:ring-primary shadow-xs font-mono"
      />
      <span className="text-secondary text-xs">–</span>
      <input
        type="time"
        value={slot.close}
        onChange={(e) => onChange({ ...slot, close: e.target.value })}
        className="px-2.5 py-1.5 rounded-lg border border-theme bg-surface text-xs text-theme focus:outline-none focus:ring-1 focus:ring-primary shadow-xs font-mono"
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-secondary hover:text-red-500 transition-colors p-1 cursor-pointer"
          title="Remove time slot"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default function HoursEditor({ section, onSave, onCancel }) {
  const profileHours = useProfileStore((s) => s.profile?.businessHours);
  const initialContent = section.content || {};

  const [title, setTitle] = useState(
    initialContent.title || section.title || "Opening Hours"
  );
  const [description, setDescription] = useState(
    initialContent.description ||
      section.description ||
      "Visit us during our operating hours. We look forward to serving you."
  );

  const [hours, setHours] = useState(() => {
    if (Array.isArray(initialContent.businessHours) && initialContent.businessHours.length === 7) {
      return initialContent.businessHours;
    }
    if (Array.isArray(profileHours) && profileHours.length === 7) {
      return profileHours;
    }
    return DEFAULT_BUSINESS_HOURS;
  });

  const toggleDay = (idx) => {
    setHours((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, isOpen: !d.isOpen } : d))
    );
  };

  const updateSlot = (dayIdx, slotIdx, slot) => {
    setHours((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? { ...d, slots: d.slots.map((s, j) => (j === slotIdx ? slot : s)) }
          : d
      )
    );
  };

  const addSlot = (dayIdx) => {
    setHours((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? { ...d, slots: [...d.slots, { open: "10:00", close: "23:00" }] }
          : d
      )
    );
  };

  const removeSlot = (dayIdx, slotIdx) => {
    setHours((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? { ...d, slots: d.slots.filter((_, j) => j !== slotIdx) }
          : d
      )
    );
  };

  const handleSave = () => {
    const updatedContent = {
      ...initialContent,
      title: title.trim() || "Opening Hours",
      description: description.trim(),
      businessHours: hours
    };

    onSave(updatedContent, {
      enabled: section.enabled,
      title: title.trim() || "Opening Hours",
      description: description.trim()
    });

    // Also sync business hours to restaurant profile
    try {
      useProfileStore.getState().saveProfile({ businessHours: hours });
    } catch (err) {
      console.warn("Could not sync business hours to profile:", err);
    }
  };

  return (
    <EditorShell
      title="Business Hours Section"
      description="Configure opening days, operational hours, and time slots displayed on your website"
      onBack={onCancel}
      onSave={handleSave}
    >
      <div>
        <Input
          label="Section Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Opening Hours"
        />
      </div>

      <div>
        <Textarea
          label="Section Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Visit us during our operating hours..."
          rows={2}
        />
      </div>

      <FormBlock
        title="Weekly Schedule"
        description="Toggle days open or closed and configure daily service time slots."
      >
        <div className="space-y-3">
          {hours.map((day, dayIdx) => (
            <div
              key={day.day}
              className={`flex flex-col sm:flex-row sm:items-start gap-4 p-3 rounded-xl border transition-all ${
                day.isOpen
                  ? "bg-surface border-theme"
                  : "bg-surface-soft/50 border-theme/40 opacity-70"
              }`}
            >
              <div className="flex items-center gap-3 min-w-[140px] pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={day.isOpen}
                    onChange={() => toggleDay(dayIdx)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-checked:bg-primary rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-4" />
                </label>
                <span className="text-xs font-semibold text-theme w-24">
                  {day.day}
                </span>
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
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline w-fit cursor-pointer pt-0.5"
                  >
                    <Plus size={12} /> Add Time Slot
                  </button>
                </div>
              ) : (
                <span className="text-xs font-medium text-secondary self-center py-1">
                  Closed
                </span>
              )}
            </div>
          ))}
        </div>
      </FormBlock>
    </EditorShell>
  );
}
