import { useState } from "react";
import { Files, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import Button from "../../../components/ui/Button";
import ModalShell from "./ModalShell";
import { copyToClipboard } from "../utils/clipboard";

/**
 * Shows one prompt per menu page, each with its own Copy button.
 * `pages` comes from generateMenuPrompts().pages
 */
export default function MultiPagePromptsModal({ isOpen, onClose, pages = [] }) {
  const [copiedPage, setCopiedPage] = useState(null);

  const handleCopy = async (page) => {
    const ok = await copyToClipboard(page.prompt);
    if (!ok) {
      toast.error("Couldn't copy the prompt. Please select the text and copy it manually.");
      return;
    }
    setCopiedPage(page.pageNumber);
    toast.success(`Page ${page.pageNumber} prompt copied to clipboard.`);
    setTimeout(() => setCopiedPage((current) => (current === page.pageNumber ? null : current)), 2000);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      icon={Files}
      size="lg"
      title="Page-wise Menu Prompts"
      subtitle={`${pages.length} prompts generated. Paste each one into your AI tool separately.`}
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {pages.map((page) => (
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
              <Button size="sm" variant={copiedPage === page.pageNumber ? "secondary" : undefined} onClick={() => handleCopy(page)}>
                {copiedPage === page.pageNumber ? <Check size={14} /> : <Copy size={14} />}
                {copiedPage === page.pageNumber ? "Copied" : "Copy"}
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
        ))}
      </div>
    </ModalShell>
  );
}
