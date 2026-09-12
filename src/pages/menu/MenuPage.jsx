import { useState } from "react";
import MenuItemsTab from "./components/MenuItemsTab";
import CategoriesTab from "./components/CategoriesTab";
import CombosTab from "./components/CombosTab";

const TABS = [
  { id: "items", label: "Menu Items" },
  { id: "categories", label: "Categories" },
  { id: "combos", label: "Combos" },
];

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState("items");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-theme">Menu</h1>
        <p className="text-sm text-secondary">Manage your restaurant menu, categories, items and combos.</p>
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-xl border border-theme overflow-hidden">
        <div className="flex border-b border-theme">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
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
    </div>
  );
}