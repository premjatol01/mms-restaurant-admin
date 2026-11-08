import { useMemo } from "react";
import ReactSelect from "react-select";

export default function Select({
  label,
  error,
  required,
  options = [],
  className = "",
  placeholder = "Select...",
  value,
  onChange,
  disabled = false,
  isClearable = false,
  isSearchable = true,
  menuPlacement = "auto",
  styles: customStyles,
  ...props
}) {
  const formattedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "object" && opt !== null) {
        return {
          value: opt.value ?? "",
          label: opt.label ?? String(opt.value ?? ""),
          ...opt,
        };
      }
      return { value: opt, label: String(opt) };
    });
  }, [options]);

  const selectedOption = useMemo(() => {
    if (value === undefined || value === null) return null;
    return (
      formattedOptions.find(
        (opt) => String(opt.value) === String(value)
      ) || null
    );
  }, [formattedOptions, value]);

  const defaultStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "38px",
      height: "38px",
      borderColor: error
        ? "#f87171"
        : state.isFocused
        ? "var(--color-primary)"
        : "var(--color-border)",
      boxShadow: state.isFocused
        ? `0 0 0 1px ${error ? "#ef4444" : "var(--color-primary)"}`
        : "none",
      "&:hover": {
        borderColor: error ? "#ef4444" : "var(--color-primary)",
      },
      borderRadius: "0.5rem",
      backgroundColor: "var(--color-surface)",
      color: "var(--color-text)",
      fontSize: "0.875rem",
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      opacity: state.isDisabled ? 0.6 : 1,
      transition: "all 0.15s ease",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 8px",
      height: "36px",
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      color: "var(--color-text)",
    }),
    singleValue: (base) => ({
      ...base,
      color: "var(--color-text)",
      fontSize: "0.875rem",
      fontWeight: "400",
    }),
    placeholder: (base) => ({
      ...base,
      color: "var(--color-text-secondary)",
      fontSize: "0.875rem",
      opacity: 1,
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? "var(--color-primary)" : "var(--color-text-secondary)",
      padding: "4px",
      cursor: "pointer",
      "&:hover": {
        color: "var(--color-primary)",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "var(--color-text-secondary)",
      padding: "4px",
      cursor: "pointer",
      "&:hover": {
        color: "var(--color-text)",
      },
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 99999,
    }),
    menu: (base) => ({
      ...base,
      zIndex: 99999,
      backgroundColor: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "0.5rem",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
    }),
    menuList: (base) => ({
      ...base,
      padding: "4px",
      backgroundColor: "var(--color-surface)",
      maxHeight: "220px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--color-primary)"
        : state.isFocused
        ? "var(--color-primary-light)"
        : "transparent",
      color: state.isSelected ? "#ffffff" : "var(--color-text)",
      fontSize: "0.875rem",
      borderRadius: "0.375rem",
      padding: "6px 10px",
      cursor: "pointer",
      transition: "background-color 0.1s ease",
      "&:active": {
        backgroundColor: "var(--color-primary)",
        color: "#ffffff",
      },
    }),
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-theme">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <ReactSelect
        value={selectedOption}
        onChange={(selected) => onChange?.(selected ? selected.value : "")}
        options={formattedOptions}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable={isClearable}
        isSearchable={isSearchable}
        menuPlacement={menuPlacement}
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        classNamePrefix="react-select"
        styles={{
          ...defaultStyles,
          ...customStyles,
        }}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}