import { useMemo, useState } from "react";
import { Sparkles, FileText, Files, Copy, Check, Minus, Plus, Eye } from "lucide-react";
import { toast } from "sonner";
import { useMenuStore } from "../../../store/menuStore";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import MultiPagePromptsModal from "../modals/MultiPagePromptsModal";
import { MENU_LAYOUTS, PROMPT_STYLES, PAGE_LIMITS, DEFAULT_PROMPT_OPTIONS } from "../data/promptOptions";
import { getMenuGroups, generateMenuPrompts } from "../utils/promptBuilder";
import { copyToClipboard } from "../utils/clipboard";

const LAYOUT_ICONS = { single: FileText, multiple: Files };

const TOGGLES = [
  { key: "includePrices", label: "Include prices", hint: "Show ₹ prices next to each item" },
  { key: "includeDescriptions", label: "Include descriptions", hint: "Show the short description under each item" },
  { key: "onlyAvailable", label: "Available items only", hint: "Skip items marked as unavailable" },
  { key: "highlightPopular", label: "Highlight popular items", hint: "Ask the AI to make popular items stand out" },
];

export default function AIPromptGenerator() {
  const { categories, menuItems } = useMenuStore();
  const [options, setOptions] = useState(DEFAULT_PROMPT_OPTIONS);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPagesModal, setShowPagesModal] = useState(false);

  const groups = useMemo(
    () => getMenuGroups({ categories, menuItems, onlyAvailable: options.onlyAvailable }),
    [categories, menuItems, options.onlyAvailable]
  );
  const itemTotal = groups.reduce((sum, g) => sum + g.items.length, 0);
  const canUseMultiple = groups.length >= 2;
  const maxPages = Math.min(PAGE_LIMITS.max, groups.length);
  const pageCount = Math.max(PAGE_LIMITS.min, Math.min(options.pageCount, maxPages));
  const isMultiple = options.layout === "multiple";

  // Any change to the settings invalidates the previously generated prompt
  const update = (patch) => {
    setOptions((prev) => ({ ...prev, ...patch }));
    setResult(null);
    setCopied(false);
  };

  const handleGenerate = () => {
    if (!groups.length) {
      toast.error("No menu items to include. Add items or change the filters.");
      return;
    }
    if (isMultiple && !canUseMultiple) {
      toast.error("A multiple-page menu needs at least 2 categories with items.");
      return;
    }

    const generated = generateMenuPrompts({ categories, menuItems, options: { ...options, pageCount } });
    setResult(generated);
    setCopied(false);

    if (isMultiple) {
      toast.success(`Prompts generated for ${generated.pages.length} pages.`);
      setShowPagesModal(true);
    } else {
      toast.success("Prompt generated successfully.");
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(result.pages[0].prompt);
    if (!ok) {
      toast.error("Couldn't copy the prompt. Please select the text and copy it manually.");
      return;
    }
    setCopied(true);
    toast.success("Prompt copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-theme rounded-xl p-5 space-y-5">
      {/* Heading */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
          <Sparkles size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-theme">Generative AI Menu Prompt</h2>
          <p className="text-sm text-secondary">
            Generate a ready-to-use prompt from your current menu, then paste it into any AI design tool to create your menu.
          </p>
        </div>
      </div>

      {/* Layout */}
      <div>
        <p className="text-sm font-medium text-theme mb-2">Menu layout</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MENU_LAYOUTS.map((layout) => {
            const Icon = LAYOUT_ICONS[layout.value];
            const selected = options.layout === layout.value;
            const disabled = layout.value === "multiple" && !canUseMultiple;
            return (
              <button
                key={layout.value}
                type="button"
                disabled={disabled}
                onClick={() => update({ layout: layout.value })}
                className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-colors ${
                  selected ? "bg-primary text-white border-transparent" : "border-theme text-theme hover:bg-primary-light"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{layout.label}</p>
                  <p className={`text-xs ${selected ? "text-white/80" : "text-secondary"}`}>
                    {disabled ? "Needs at least 2 categories with items" : layout.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page count (multiple only) */}
      {isMultiple && canUseMultiple && (
        <div>
          <p className="text-sm font-medium text-theme mb-2">Number of pages</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Fewer pages"
              disabled={pageCount <= PAGE_LIMITS.min}
              onClick={() => update({ pageCount: pageCount - 1 })}
              className="w-9 h-9 rounded-lg border border-theme text-theme flex items-center justify-center hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-theme">{pageCount}</span>
            <button
              type="button"
              aria-label="More pages"
              disabled={pageCount >= maxPages}
              onClick={() => update({ pageCount: pageCount + 1 })}
              className="w-9 h-9 rounded-lg border border-theme text-theme flex items-center justify-center hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
            <span className="text-xs text-secondary">
              Categories are split across pages automatically (max {maxPages}).
            </span>
          </div>
        </div>
      )}

      {/* Name + style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Restaurant name (optional)"
          placeholder="e.g., Spice Route"
          value={options.restaurantName}
          onChange={(e) => update({ restaurantName: e.target.value })}
        />
        <Select
          label="Design style"
          value={options.styleId}
          onChange={(val) => update({ styleId: val })}
          options={PROMPT_STYLES.map((s) => ({ value: s.id, label: s.label }))}
        />
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TOGGLES.map((toggle) => (
          <label key={toggle.key} className="flex items-start gap-3 p-3 rounded-lg border border-theme cursor-pointer">
            <input
              type="checkbox"
              checked={options[toggle.key]}
              onChange={(e) => update({ [toggle.key]: e.target.checked })}
              className="mt-0.5 w-4 h-4"
              style={{ accentColor: "var(--color-primary)" }}
            />
            <div>
              <p className="text-sm font-medium text-theme">{toggle.label}</p>
              <p className="text-xs text-secondary">{toggle.hint}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Generate */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-secondary">
          The prompt will include {groups.length} {groups.length === 1 ? "category" : "categories"} and {itemTotal} items from your current menu.
        </p>
        <Button onClick={handleGenerate}>
          <Sparkles size={16} /> Generate Prompt
        </Button>
      </div>

      {/* Result: single page -> shown inline */}
      {result && result.pages.length === 1 && (
        <div className="border-t border-theme pt-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-theme">Your prompt</p>
              <p className="text-xs text-secondary">
                {result.categoryTotal} categories · {result.itemTotal} items
              </p>
            </div>
            <Button variant={copied ? "secondary" : undefined} onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy Prompt"}
            </Button>
          </div>
          <pre className="bg-theme border border-theme rounded-lg p-4 text-xs text-theme font-mono whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
            {result.pages[0].prompt}
          </pre>
        </div>
      )}

      {/* Result: multiple pages -> summary + popup */}
      {result && result.pages.length > 1 && (
        <div className="border-t border-theme pt-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-theme p-4">
            <div>
              <p className="text-sm font-semibold text-theme">{result.pages.length} page prompts ready</p>
              <p className="text-xs text-secondary">
                {result.categoryTotal} categories · {result.itemTotal} items, split across {result.pages.length} pages
              </p>
            </div>
            <Button variant="secondary" onClick={() => setShowPagesModal(true)}>
              <Eye size={16} /> View Prompts
            </Button>
          </div>
        </div>
      )}

      <MultiPagePromptsModal
        isOpen={showPagesModal}
        onClose={() => setShowPagesModal(false)}
        pages={result?.pages ?? []}
      />
    </div>
  );
}
