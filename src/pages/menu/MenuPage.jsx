import { useState, useEffect } from "react";
import MenuItemsTab from "./components/MenuItemsTab";
import CategoriesTab from "./components/CategoriesTab";
import CombosTab from "./components/CombosTab";
import AIPromptGenerator from "./components/AIPromptGenerator";
import ContactDesignerModal from "./modals/ContactDesignerModal";
import { useMenuStore } from "../../store/menuStore";

const TABS = [
  { id: "items", label: "Menu Items" },
  { id: "categories", label: "Categories" },
  { id: "combos", label: "Combos" },
];

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState("items");
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [showDesigner, setShowDesigner] = useState(false);

  const { fetchMenuData, loading, error } = useMenuStore();

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-7rem)]">
        <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-secondary">Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Tabs Bar & Content Card */}
      <div className="flex-1 min-h-0 flex flex-col bg-surface rounded-xl border border-theme overflow-hidden shadow-sm">
        <div className="flex-none flex border-b border-theme overflow-x-auto bg-surface">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary font-semibold"
                  : "text-secondary hover:text-theme"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 flex flex-col p-4 overflow-hidden">
          {activeTab === "items" && (
            <MenuItemsTab 
              onShowAIPrompt={() => setShowAIPrompt(true)}
              onShowDesigner={() => setShowDesigner(true)}
            />
          )}
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
