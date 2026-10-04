import { useEffect } from "react";
import TablesTab from "./components/TablesTab";
import { useTablesQRStore } from "../../store/tablesQRStore";

export default function TablesAndQRPage() {
  const { fetchData, loading } = useTablesQRStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="p-8 text-center text-secondary">Loading tables and QR codes...</div>;
  }

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
