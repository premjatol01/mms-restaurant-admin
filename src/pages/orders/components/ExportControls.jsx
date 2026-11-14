import { useMemo, useState } from "react";
import { FileSpreadsheet, Lock } from "lucide-react";
import { toast } from "sonner";
import { useOrdersStore } from "../../../store/ordersStore";
import { useSubscriptionPlan } from "../../../hooks/useSubscriptionPlan";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import { MONTHS } from "../constants";
import { exportOrdersToExcel } from "../utils/exportOrdersToExcel";

const MONTH_OPTIONS = [
  { value: "all", label: "All Months" },
  ...MONTHS.map((label, index) => ({ value: String(index), label }))
];

// Month + year pickers and the Excel export button.
export default function ExportControls() {
  const orders = useOrdersStore((state) => state.orders);
  const { hasFeature } = useSubscriptionPlan();
  const canExport = hasFeature("gst_reports");

  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(String(today.getMonth()));
  const [year, setYear] = useState(String(today.getFullYear()));
  const [exporting, setExporting] = useState(false);

  // Current year, the two before it, plus any year that has orders.
  const yearOptions = useMemo(() => {
    const years = new Set([today.getFullYear(), today.getFullYear() - 1, today.getFullYear() - 2]);
    orders.forEach((order) => {
      if (order.createdAt) years.add(new Date(order.createdAt).getFullYear());
    });
    return [...years].sort((a, b) => b - a).map((y) => ({ value: String(y), label: String(y) }));
  }, [orders, today]);

  const handleExport = async () => {
    if (!canExport) {
      toast.error("Detailed Order & GST Excel Reports are an Enterprise Plan feature. Please upgrade your package in Subscription to unlock.");
      return;
    }

    const { orders: allOrders, sessions, completedSessions, getTableName } = useOrdersStore.getState();
    const isAllMonths = month === "all";
    const selectedMonth = isAllMonths ? "all" : Number(month);
    const selectedYear = Number(year);

    const monthOrders = allOrders.filter((order) => {
      const created = new Date(order.createdAt);
      if (created.getFullYear() !== selectedYear) return false;
      if (!isAllMonths && created.getMonth() !== selectedMonth) return false;
      return true;
    });

    if (monthOrders.length === 0) {
      toast.error(`No orders found for ${isAllMonths ? "the selected year" : MONTHS[selectedMonth]} ${selectedYear}.`);
      return;
    }

    setExporting(true);
    try {
      await exportOrdersToExcel({
        orders: monthOrders,
        sessions: [...sessions, ...completedSessions],
        getTableName,
        month: selectedMonth,
        year: selectedYear,
      });
      toast.success(
        `Exported ${monthOrders.length} orders for ${isAllMonths ? "the year" : MONTHS[selectedMonth]} ${selectedYear}.`
      );
    } catch (error) {
      console.error("Orders export failed", error);
      toast.error("Couldn't create the Excel file. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={month} onChange={setMonth} options={MONTH_OPTIONS} className="w-36" />
      <Select value={year} onChange={setYear} options={yearOptions} className="w-24" />
      <Button onClick={handleExport} disabled={exporting} title={!canExport ? "Requires Enterprise Plan" : undefined}>
        <FileSpreadsheet size={16} /> {exporting ? "Exporting..." : "Export Excel"}
        {!canExport && <Lock size={12} className="ml-1 text-amber-500" />}
      </Button>
    </div>
  );
}
