import { useState, useEffect } from "react";
import { Sparkles, Palette } from "lucide-react";
import MenuItemsTab from "./components/MenuItemsTab";
import CategoriesTab from "./components/CategoriesTab";
import CombosTab from "./components/CombosTab";
import AIPromptGenerator from "./components/AIPromptGenerator";
import ContactDesignerModal from "./modals/ContactDesignerModal";
import Button from "../../components/ui/Button";
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
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 bg-red-50 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="bg-surface rounded-xl border border-theme overflow-hidden mt-4">
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