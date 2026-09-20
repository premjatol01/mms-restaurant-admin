// Dummy gallery images. Inline SVGs are used so they work offline.
const placeholder = (label, from, to) => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs>` +
    `<rect width="600" height="600" fill="url(#g)"/>` +
    `<text x="300" y="315" font-family="sans-serif" font-size="34" fill="#ffffff" text-anchor="middle">${label}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const mockGalleryImages = [
  { id: "g1", url: placeholder("Butter Chicken", "#f29191", "#e06b6b"), caption: "Our signature butter chicken" },
  { id: "g2", url: placeholder("Dining Hall", "#7cc4c6", "#4a9ea1"), caption: "Main dining hall" },
  { id: "g3", url: placeholder("Tandoor", "#f4a261", "#e76f51"), caption: "Fresh from the tandoor" },
  { id: "g4", url: placeholder("Desserts", "#c9a7eb", "#9b72cf"), caption: "House-made desserts" }
];
