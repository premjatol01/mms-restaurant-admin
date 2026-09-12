import { useState } from "react";
import { useOrdersStore } from "../../../store/ordersStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import EmptyState from "../../../components/ui/EmptyState";
import CompletedSessionDetails from "./CompletedSessionDetails";

export default function CompletedTab() {
  const { completedSessions, getTableName, orders } = useOrdersStore();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [viewSession, setViewSession] = useState(null);

  const filteredSessions = completedSessions.filter((session) => {
    const matchSearch = !search || 
      session.sessionNumber.toLowerCase().includes(search.toLowerCase()) ||
      getTableName(session.tableId).toLowerCase().includes(search.toLowerCase());
    const matchTable = !tableFilter || session.tableId === tableFilter;
    return matchSearch && matchTable;
  });

  const clearFilters = () => { setSearch(""); setDateFilter(""); setTableFilter(""); };
  const hasFilters = search || tableFilter;

  const uniqueTables = [...new Set(completedSessions.map((s) => s.tableId))];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search sessions..." />
        </div>
        <Select
          value={dateFilter}
          onChange={setDateFilter}
          options={[
            { value: "", label: "All Dates" },
            { value: "today", label: "Today" },
            { value: "yesterday", label: "Yesterday" }
          ]}
          className="w-full sm:w-36"
        />
        <Select
          value={tableFilter}
          onChange={setTableFilter}
          options={[
            { value: "", label: "All Tables" },
            ...uniqueTables.map((t) => ({ value: t, label: getTableName(t) }))
          ]}
          className="w-full sm:w-36"
        />
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="text-sm text-primary hover:underline">
          Clear filters
        </button>
      )}

      {!completedSessions.length ? (
        <EmptyState
          title="No completed sessions"
          description="Completed table sessions will appear here."
        />
      ) : filteredSessions.length === 0 ? (
        <div className="p-8 text-center text-secondary">No sessions match your filters.</div>
      ) : (
        <div className="overflow-x-auto border border-theme rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-primary-light/30 border-b border-theme">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-theme">Session</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Table</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Orders</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Total</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Closed At</th>
                <th className="text-right px-4 py-3 font-medium text-theme">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => (
                <tr key={session.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10">
                  <td className="px-4 py-3 font-medium text-theme">{session.sessionNumber}</td>
                  <td className="px-4 py-3 text-theme">{getTableName(session.tableId)}</td>
                  <td className="px-4 py-3 text-theme">{session.orderIds.length}</td>
                  <td className="px-4 py-3 font-medium text-theme">₹{session.total}</td>
                  <td className="px-4 py-3 text-secondary">
                    {session.closedAt ? new Date(session.closedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setViewSession(session)} className="text-primary hover:underline text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewSession && (
        <CompletedSessionDetails
          session={viewSession}
          onClose={() => setViewSession(null)}
        />
      )}
    </div>
  );
}