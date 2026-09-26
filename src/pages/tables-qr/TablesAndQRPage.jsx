import TablesTab from "./components/TablesTab";

export default function TablesAndQRPage() {
  return (
    <div className="space-y-5">
      <div className="bg-surface rounded-xl border border-theme overflow-hidden">
        <div className="p-6">
          <TablesTab />
        </div>
      </div>
    </div>
  );
}
