import { useState } from "react";
import TablesTab from "./components/TablesTab";
import QRCodesTab from "./components/QRCodesTab";

const TABS = [
  { id: "tables", label: "Tables" },
  { id: "qr", label: "QR Codes" },
];

export default function TablesAndQRPage() {
  const [activeTab, setActiveTab] = useState("tables");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-theme">Tables & QR</h1>
        <p className="text-sm text-secondary">Manage your restaurant tables and assign QR codes for your customers.</p>
      </div>

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
          {activeTab === "tables" && <TablesTab />}
          {activeTab === "qr" && <QRCodesTab />}
        </div>
      </div>
    </div>
  );
}