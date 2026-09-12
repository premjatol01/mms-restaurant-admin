import Select from "react-select";

export default function SelectInput({
  label,
  options,
  value,
  onChange,
  error,
  isMulti = false,
  placeholder = "Select...",
  required = false,
  disabled = false,
}) {
  const selectedValue = isMulti
    ? options.filter((opt) => value?.includes(opt.value))
    : options.find((opt) => opt.value === value);

  return (
    <div>
      {label && (
        <label className="text-sm font-medium text-theme block mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Select
        isMulti={isMulti}
        options={options}
        value={selectedValue}
        onChange={(selected) => {
          if (isMulti) {
            onChange(selected.map((s) => s.value));
          } else {
            onChange(selected?.value || "");
          }
        }}
        placeholder={placeholder}
        isDisabled={disabled}
        classNamePrefix="rs"
        styles={{
          control: (base, state) => ({
            ...base,
            backgroundColor: "var(--color-surface)",
            borderColor: error ? "#f87171" : "var(--color-border)",
            boxShadow: state.isFocused ? "0 0 0 2px var(--color-primary-light)" : "none",
            "&:hover": { borderColor: "var(--color-primary)" },
            fontSize: "0.875rem",
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            zIndex: 50,
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? "var(--color-primary)"
              : state.isFocused
              ? "var(--color-primary-light)"
              : "transparent",
            color: state.isSelected ? "#fff" : "var(--color-text)",
            fontSize: "0.875rem",
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: "var(--color-primary-light)",
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: "var(--color-text)",
            fontSize: "0.75rem",
          }),
          input: (base) => ({ ...base, color: "var(--color-text)" }),
          singleValue: (base) => ({ ...base, color: "var(--color-text)" }),
        }}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}