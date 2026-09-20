import { useState } from "react";
import { normalizeHex } from "../../utils/color";
import { inputClass, labelClass } from "./fieldStyles";

// Colour swatch picker plus a hex input. `value` must always be a valid #rrggbb string.
export default function ColorField({ label, hint, value, onChange }) {
  const [text, setText] = useState(value);
  const [lastValue, setLastValue] = useState(value);

  // Keep the text box in sync when the value changes from outside (preset, reset).
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }

  const invalid = normalizeHex(text) === null;

  const handleText = (e) => {
    const next = e.target.value;
    setText(next);
    const hex = normalizeHex(next);
    if (hex) onChange(hex);
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 p-0.5 rounded-lg border border-theme bg-surface cursor-pointer shrink-0"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={text}
          onChange={handleText}
          onBlur={() => setText(value)}
          maxLength={7}
          spellCheck={false}
          className={`${inputClass} font-mono uppercase`}
          style={invalid ? { borderColor: "#f87171" } : undefined}
          aria-label={`${label} hex value`}
          aria-invalid={invalid}
        />
      </div>
      {invalid ? (
        <p className="mt-1 text-xs text-red-500">Enter a hex color like #f29191</p>
      ) : (
        hint && <p className="mt-1 text-xs text-secondary">{hint}</p>
      )}
    </div>
  );
}
