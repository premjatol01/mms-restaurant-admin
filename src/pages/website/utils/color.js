// Small colour helpers used by the colour settings.

// Accepts "#abc", "abc", "#aabbcc", "AABBCC" and returns "#aabbcc", or null when invalid.
export function normalizeHex(input) {
  if (typeof input !== "string") return null;
  let hex = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  return /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex.toLowerCase()}` : null;
}

function hexToRgb(hex) {
  const value = normalizeHex(hex);
  if (!value) return null;
  return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
}

function luminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// WCAG contrast ratio between two hex colours (1 to 21).
export function contrastRatio(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// Picks white or dark text for a given background.
export function readableOn(bg) {
  return contrastRatio(bg, "#ffffff") >= contrastRatio(bg, "#111827") ? "#ffffff" : "#111827";
}
