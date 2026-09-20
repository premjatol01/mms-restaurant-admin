// Standard veg / non-veg indicator.
export default function VegDot({ isVeg }) {
  const color = isVeg ? "#16a34a" : "#dc2626";
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 border-2 rounded-sm shrink-0"
      style={{ borderColor: color }}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}
