import TablesTab from "./components/TablesTab";

export default function TablesAndQRPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-theme">Tables & QR</h1>
        <p className="text-sm text-secondary">Manage your restaurant tables, assign QR codes and download them for printing.</p>
      </div>

      <div className="bg-surface rounded-xl border border-theme overflow-hidden">
        <div className="p-6">
          <TablesTab />
        </div>
      </div>
    </div>
  );
}
