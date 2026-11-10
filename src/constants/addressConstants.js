export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
].map((s) => ({ value: s, label: s }));

export const COUNTRY_OPTIONS = [
  { value: "India", label: "India" },
  { value: "Other", label: "Other" }
];

export const selectCustomStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "transparent",
    borderColor: state.isFocused ? "var(--color-primary, #f29191)" : "var(--color-border, #e2e8f0)",
    borderRadius: "0.5rem",
    minHeight: "38px",
    boxShadow: state.isFocused ? "0 0 0 1px var(--color-primary, #f29191)" : "none",
    "&:hover": {
      borderColor: "var(--color-primary, #f29191)",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "0.5rem",
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#f29191"
      : state.isFocused
      ? "rgba(242, 145, 145, 0.15)"
      : "transparent",
    color: state.isSelected ? "#ffffff" : "#1f2937",
    cursor: "pointer",
    fontSize: "0.875rem",
  }),
  singleValue: (base) => ({
    ...base,
    color: "inherit",
    fontSize: "0.875rem",
  }),
  input: (base) => ({
    ...base,
    color: "inherit",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9ca3af",
    fontSize: "0.875rem",
  }),
};
