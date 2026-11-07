import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export default function SearchInput({ 
  value = "", 
  onChange, 
  placeholder = "Search...",
  delay = 300,
  className = ""
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const timerRef = useRef(null);

  // Sync with external value changes (e.g. clear filters)
  useEffect(() => {
    setDisplayValue(value || "");
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setDisplayValue(val);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onChange?.(val);
    }, delay);
  };

  const handleClear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setDisplayValue("");
    onChange?.("");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 rounded-lg border border-theme text-sm text-theme bg-surface focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all"
      />
      {displayValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-theme p-0.5 rounded cursor-pointer transition-colors"
          title="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
