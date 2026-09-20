import { useEffect, useState } from "react";

// Shows a number and draws attention to it whenever it changes: the number
// pops and a small ping dot shows for ~1.2s.
//   variant="badge" -> round notification badge (used on the tab)
//   variant="stat"  -> plain big number (used on the summary card)
// Nothing animates on first render, and motion is skipped for users who
// prefer reduced motion.
export default function AnimatedCount({ value, variant = "stat", className = "" }) {
  const [previous, setPrevious] = useState(value);
  const [pulseId, setPulseId] = useState(0);
  const [pulsing, setPulsing] = useState(false);

  // Detect the change while rendering (avoids calling setState inside an effect).
  if (value !== previous) {
    setPrevious(value);
    setPulseId((id) => id + 1);
    setPulsing(true);
  }

  useEffect(() => {
    if (pulseId === 0) return undefined;
    const timer = setTimeout(() => setPulsing(false), 1200);
    return () => clearTimeout(timer);
  }, [pulseId]);

  const ping = pulsing && (
    <span
      key={pulseId}
      aria-hidden="true"
      className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 motion-safe:animate-ping"
    />
  );

  if (variant === "badge") {
    return (
      <span
        aria-live="polite"
        className={`relative inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white ring-2 ring-white transition-transform duration-300 ${
          pulsing ? "motion-safe:scale-125" : ""
        } ${className}`}
      >
        {value}
        {ping}
      </span>
    );
  }

  return (
    <span aria-live="polite" className={`relative inline-block ${className}`}>
      <span
        className={`inline-block transition-all duration-300 ${
          pulsing ? "motion-safe:scale-125 text-[color:var(--color-primary)]" : ""
        }`}
      >
        {value}
      </span>
      {ping}
    </span>
  );
}
