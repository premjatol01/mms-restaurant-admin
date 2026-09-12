export default function Select({ label, error, required, options = [], className = "", placeholder = "Select...", value, onChange, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-theme">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg border text-sm text-theme bg-surface transition-colors
          ${error ? "border-red-400 focus:border-red-500" : "border-theme focus:border-[var(--color-primary)]"}
          focus:outline-none focus:ring-2 ${error ? "focus:ring-red-100" : "focus:ring-[var(--color-primary-light)]"}
          disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}