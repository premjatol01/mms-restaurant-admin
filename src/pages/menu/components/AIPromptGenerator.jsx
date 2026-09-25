import { useMemo, useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useMenuStore } from "../../../store/menuStore";
import Button from "../../../components/ui/Button";
import ModalShell from "../modals/ModalShell";
import { DEFAULT_PROMPT_OPTIONS } from "../data/promptOptions";
import { getMenuGroups, generateMenuPrompts } from "../utils/promptBuilder";
import { copyToClipboard } from "../utils/clipboard";

function AIPromptContent() {
  const { categories, menuItems } = useMenuStore();
  const [copiedPage, setCopiedPage] = useState(null);

  const result = useMemo(() => {
    const baseOptions = { ...DEFAULT_PROMPT_OPTIONS, onlyAvailable: true };
    const groups = getMenuGroups({ categories, menuItems, onlyAvailable: true });
    const itemTotal = groups.reduce((sum, g) => sum + g.items.length, 0);

    if (itemTotal === 0) return null;

    // Automatically determine pages (split if 10+ items)
    const isMultiple = itemTotal >= 10;
    const pageCount = isMultiple ? Math.ceil(itemTotal / 10) : 1;

    const options = {
      ...baseOptions,
      layout: isMultiple ? "multiple" : "single",
      pageCount,
    };

    return generateMenuPrompts({ categories, menuItems, options });
  }, [categories, menuItems]);

  const handleCopy = async (page) => {
    const ok = await copyToClipboard(page.prompt);
    if (!ok) {
      toast.error("Couldn't copy the prompt. Please select the text and copy it manually.");
      return;
    }
    setCopiedPage(page.pageNumber);
    toast.success(result.pages.length > 1 ? `Page ${page.pageNumber} prompt copied!` : "Prompt copied to clipboard.");
    setTimeout(() => setCopiedPage((current) => (current === page.pageNumber ? null : current)), 2000);
  };

  if (!result) {
    return (
      <div className="p-8 text-center text-secondary">
        No available menu items to generate a prompt for.
      </div>
    );
  }

  // Single page view
  if (result.pages.length <= 1) {
    const page = result.pages[0];
    const isCopied = copiedPage === page.pageNumber;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-theme">Your Prompt</p>
            <p className="text-xs text-secondary">
              {result.categoryTotal} {result.categoryTotal === 1 ? "category" : "categories"} · {result.itemTotal} items
            </p>
          </div>
          <Button variant={isCopied ? "secondary" : undefined} onClick={() => handleCopy(page)}>
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            {isCopied ? "Copied!" : "Copy Prompt"}
          </Button>
        </div>
        <pre className="bg-theme border border-theme rounded-lg p-4 text-xs text-theme font-mono whitespace-pre-wrap break-words max-h-[60vh] overflow-y-auto">
          {page.prompt}
        </pre>
      </div>
    );
  }

  // Multi-page view
  return (
    <div className="space-y-6">
      <div className="mb-2">
        <p className="text-sm font-semibold text-theme">Your Prompts</p>
        <p className="text-xs text-secondary">
          Your menu has {result.itemTotal} items, so we've split it into {result.pages.length} pages. Paste each one separately into your AI tool.
        </p>
      </div>
      {result.pages.map((page) => {
        const isCopied = copiedPage === page.pageNumber;
        return (
          <div key={page.pageNumber} className="border border-theme rounded-lg overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-primary-light/30 border-b border-theme">
              <div>
                <p className="text-sm font-semibold text-theme">
                  Page {page.pageNumber} of {page.totalPages}
                </p>
                <p className="text-xs text-secondary">
                  {page.categoryNames.length} {page.categoryNames.length === 1 ? "category" : "categories"} · {page.itemCount} items
                </p>
              </div>
              <Button size="sm" variant={isCopied ? "secondary" : undefined} onClick={() => handleCopy(page)}>
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                {isCopied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {page.categoryNames.map((name) => (
                  <span key={name} className="text-xs px-2 py-0.5 rounded-full border border-theme text-secondary">
                    {name}
                  </span>
                ))}
              </div>
              <pre className="bg-theme border border-theme rounded-lg p-3 text-xs text-theme font-mono whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                {page.prompt}
              </pre>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AIPromptGenerator({ isOpen, onClose }) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      icon={Sparkles}
      size="lg"
      title="Generative AI Menu Prompt"
      subtitle="Copy the prompt below and paste it into any AI design tool to generate your menu."
    >
      <AIPromptContent />
    </ModalShell>
  );
}
