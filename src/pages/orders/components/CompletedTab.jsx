import { useState, useMemo, useEffect } from "react";
import { useOrdersStore } from "../../../store/ordersStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import Pagination from "../../../components/ui/Pagination";
import CompletedSessionDetails from "./CompletedSessionDetails";

export default function CompletedTab() {
  const { completedSessions, getTableName, orders } = useOrdersStore();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [draftDate, setDraftDate] = useState("");
  const [draftTable, setDraftTable] = useState("");
  const [viewSession, setViewSession] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  const filteredSessions = useMemo(() => {
    return completedSessions.filter((session) => {
      const matchSearch = !search || 
        session.sessionNumber.toLowerCase().includes(search.toLowerCase()) ||
        getTableName(session.tableId).toLowerCase().includes(search.toLowerCase());
      const matchTable = !tableFilter || session.tableId === tableFilter;
      return matchSearch && matchTable;
    });
  }, [completedSessions, search, tableFilter, getTableName]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [search, dateFilter, tableFilter]);

  const paginatedSessions = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return filteredSessions.slice(start, start + pagination.limit);
  }, [filteredSessions, pagination]);

  const handleApplyFilters = () => {
    setDateFilter(draftDate);
    setTableFilter(draftTable);
  };

  const clearFilters = () => {
    setSearch("");
    setDraftDate("");
    setDraftTable("");
    setDateFilter("");
    setTableFilter("");
  };

  const hasFilters = search || tableFilter || dateFilter;

  const uniqueTables = [...new Set(completedSessions.map((s) => s.tableId))];

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full">
      <div className="flex-none mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search sessions..." />
        </div>
        <Select
          value={draftDate}
          onChange={setDraftDate}
          options={[
            { value: "", label: "All Dates" },
            { value: "today", label: "Today" },
            { value: "yesterday", label: "Yesterday" }
          ]}
          className="w-full sm:w-36"
        />
        <Select
          value={draftTable}
          onChange={setDraftTable}
          options={[
            { value: "", label: "All Tables" },
            ...uniqueTables.map((t) => ({ value: t, label: getTableName(t) }))
          ]}
          className="w-full sm:w-36"
        />
        <Button variant="secondary" onClick={handleApplyFilters}>
          Apply
        </Button>
      </div>

      {hasFilters && (
        <div className="flex-none mb-3">
          <button onClick={clearFilters} className="text-xs text-primary hover:underline cursor-pointer">
            Clear filters
          </button>
        </div>
      )}

      {!completedSessions.length ? (
        <div className="flex-1 min-h-0 flex items-center justify-center bg-surface border border-theme rounded-xl p-8">
          <EmptyState
            title="No completed sessions"
            description="Completed table sessions will appear here."
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col bg-surface border border-theme rounded-xl overflow-hidden shadow-sm">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead className="bg-primary-light/30 border-b border-theme sticky top-0 z-10 backdrop-blur-sm bg-surface/95">
                <tr>
                  <th className="text-left px-5 py-3.5 font-medium text-theme">Session</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Table</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Orders</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Total</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Closed At</th>
                  <th className="text-right px-5 py-3.5 font-medium text-theme">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-20 text-center text-secondary">
                      No sessions match your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedSessions.map((session) => (
                    <tr key={session.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-theme">{session.sessionNumber}</td>
                      <td className="px-4 py-3.5 text-theme">{getTableName(session.tableId)}</td>
                      <td className="px-4 py-3.5 text-theme font-medium">{session.orderIds.length}</td>
                      <td className="px-4 py-3.5 font-semibold text-theme">₹{session.total}</td>
                      <td className="px-4 py-3.5 text-secondary">
                        {session.closedAt ? new Date(session.closedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => setViewSession(session)} className="text-primary hover:underline text-sm font-medium cursor-pointer">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pinned Bottom Pagination */}
          <Pagination
            pagination={pagination}
            totalItems={filteredSessions.length}
            onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
            onLimitChange={(newLimit) => setPagination({ page: 1, limit: newLimit })}
            itemName="sessions"
          />
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