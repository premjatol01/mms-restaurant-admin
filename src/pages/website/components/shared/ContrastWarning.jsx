import { TriangleAlert } from "lucide-react";
import { contrastRatio } from "../../utils/color";

// Shows a hint when text is hard to read on its background (WCAG AA = 4.5:1).
export default function ContrastWarning({ foreground, background, message }) {
  const ratio = contrastRatio(foreground, background);
  if (ratio >= 4.5) return null;
  return (
    <p className="flex items-start gap-1.5 text-xs text-amber-600">
      <TriangleAlert size={14} className="mt-0.5 shrink-0" />
      <span>{message} (contrast {ratio.toFixed(1)}:1, aim for 4.5:1 or higher)</span>
    </p>
  );
}
