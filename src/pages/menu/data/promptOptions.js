// Options used by the Generative AI Menu Prompt feature.

export const MENU_LAYOUTS = [
  { value: "single", label: "Single-page menu", description: "The whole menu on one page" },
  { value: "multiple", label: "Multiple-page menu", description: "A separate prompt for each page" },
];

export const PAGE_LIMITS = { min: 2, max: 6 };

export const PROMPT_STYLES = [
  {
    id: "modern",
    label: "Modern & Minimal",
    prompt: "clean layout, generous white space, crisp sans-serif typography and one subtle accent colour",
  },
  {
    id: "classic",
    label: "Classic & Elegant",
    prompt: "refined serif typography, thin gold or cream ornamental borders, a fine-dining feel",
  },
  {
    id: "rustic",
    label: "Rustic & Handcrafted",
    prompt: "kraft-paper texture, hand-drawn illustrations, warm earthy colours and a chalkboard-style feel",
  },
  {
    id: "playful",
    label: "Playful & Colourful",
    prompt: "bright colours, rounded fonts, fun doodle icons and a cheerful, casual-dining mood",
  },
  {
    id: "dark",
    label: "Dark & Luxurious",
    prompt: "deep charcoal background, metallic gold accents, elegant typography and a premium lounge atmosphere",
  },
];

export const DEFAULT_PROMPT_OPTIONS = {
  layout: "single",
  pageCount: 2,
  restaurantName: "",
  styleId: "modern",
  includePrices: true,
  includeDescriptions: true,
  onlyAvailable: true,
  highlightPopular: true,
};
