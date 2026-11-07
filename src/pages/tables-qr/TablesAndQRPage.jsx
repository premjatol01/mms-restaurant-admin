import { useEffect } from "react";
import TablesTab from "./components/TablesTab";
import { useTablesQRStore } from "../../store/tablesQRStore";

export default function TablesAndQRPage() {
  const { fetchData, loading } = useTablesQRStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-7rem)]">
        <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-secondary">Loading tables and QR codes...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <TablesTab />
    </div>
  );
}
