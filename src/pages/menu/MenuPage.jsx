import { useState } from "react";
import { Sparkles, Palette } from "lucide-react";
import MenuItemsTab from "./components/MenuItemsTab";
import CategoriesTab from "./components/CategoriesTab";
import CombosTab from "./components/CombosTab";
import AIPromptGenerator from "./components/AIPromptGenerator";
import ContactDesignerModal from "./modals/ContactDesignerModal";
import Button from "../../components/ui/Button";

const TABS = [
  { id: "items", label: "Menu Items" },
  { id: "categories", label: "Categories" },
  { id: "combos", label: "Combos" },
];

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState("items");
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [showDesigner, setShowDesigner] = useState(false);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-end gap-4">
        {/* Header action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" onClick={() => setShowAIPrompt(true)}>
            <Sparkles size={15} />
            AI Menu Prompt
          </Button>
          <Button variant="secondary" onClick={() => setShowDesigner(true)}>
            <Palette size={15} />
            Contact Designer
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-xl border border-theme overflow-hidden">
        <div className="flex border-b border-theme overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-theme hover:bg-primary-light"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "items" && <MenuItemsTab />}
          {activeTab === "categories" && <CategoriesTab />}
          {activeTab === "combos" && <CombosTab />}
        </div>
      </div>

      {/* Modals — available from anywhere on the page */}
      <AIPromptGenerator isOpen={showAIPrompt} onClose={() => setShowAIPrompt(false)} />
      <ContactDesignerModal isOpen={showDesigner} onClose={() => setShowDesigner(false)} />
    </div>
  );
}