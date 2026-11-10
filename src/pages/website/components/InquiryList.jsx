import { useEffect, useMemo, useState } from "react";
import {
  Inbox,
  Clock,
  CheckCircle2,
  RotateCcw,
  MessageSquare,
  Phone,
  Mail,
  Eye,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useWebsiteStore } from "../../../store/websiteStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import Pagination from "../../../components/ui/Pagination";
import InquiryDetailsDrawer, { StatusBadge } from "../modals/InquiryDetailsDrawer";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateStr);
  }
};

function PurposeTag({ purpose }) {
  if (!purpose) return <span className="text-secondary">—</span>;
  return (
    <span className="inline-block text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-primary-soft/20 text-theme border border-primary/20 whitespace-nowrap">
      {purpose}
    </span>
  );
}

function SummaryCards({ stats }) {
  const cards = [
    {
      label: "Total Inquiries",
      value: stats.total || 0,
      Icon: Inbox,
      tile: "bg-blue-100 dark:bg-blue-950/40",
      icon: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "New",
      value: stats.new || 0,
      Icon: Clock,
      tile: "bg-sky-100 dark:bg-sky-950/40",
      icon: "text-sky-600 dark:text-sky-400",
    },
    {
      label: "In Progress",
      value: stats.inProgress || 0,
      Icon: RotateCcw,
      tile: "bg-amber-100 dark:bg-amber-950/40",
      icon: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Resolved",
      value: stats.resolved || 0,
      Icon: CheckCircle2,
      tile: "bg-emerald-100 dark:bg-emerald-950/40",
      icon: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="flex-none grid grid-cols-2 md:grid-cols-4 gap-3.5">
      {cards.map(({ label, value, Icon, tile, icon }) => (
        <div key={label} className="bg-surface rounded-xl border border-theme p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tile}`}>
              <Icon className={icon} size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-secondary truncate">{label}</p>
              <p className="text-xl font-bold text-theme truncate">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InquiryList() {
  const { inquiries, updateInquiryStatus, getInquiryStats, loadInquiries } = useWebsiteStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const [draftPurpose, setDraftPurpose] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const stats = getInquiryStats();

  const selectedInquiry = inquiries.find((inq) => inq.id === selectedId) ?? null;

  const purposeOptions = useMemo(() => {
    const purposes = [...new Set(inquiries.map((inq) => inq.purpose).filter(Boolean))];
    return [
      { value: "", label: "All Purposes" },
      ...purposes.map((p) => ({ value: p, label: p })),
    ];
  }, [inquiries]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        inq.name?.toLowerCase().includes(q) ||
        inq.mobile?.includes(search) ||
        inq.email?.toLowerCase().includes(q) ||
        inq.message?.toLowerCase().includes(q);
      const matchStatus = !statusFilter || inq.status === statusFilter;
      const matchPurpose = !purposeFilter || inq.purpose === purposeFilter;
      return matchSearch && matchStatus && matchPurpose;
    });
  }, [inquiries, search, statusFilter, purposeFilter]);

  // Reset pagination when search or filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [search, statusFilter, purposeFilter]);

  const paginatedInquiries = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return filteredInquiries.slice(start, start + pagination.limit);
  }, [filteredInquiries, pagination]);

  const handleApplyFilters = () => {
    setStatusFilter(draftStatus);
    setPurposeFilter(draftPurpose);
  };

  const clearFilters = () => {
    setSearch("");
    setDraftStatus("");
    setDraftPurpose("");
    setStatusFilter("");
    setPurposeFilter("");
  };

  const hasFilters = Boolean(search || statusFilter || purposeFilter);

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full space-y-3.5">
      {/* 1. Summary Cards */}
      <SummaryCards stats={stats} />

      {/* 2. Filter Bar */}
      <div className="flex-none flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by customer name, phone, or email..."
          />
        </div>
        <Select
          value={draftPurpose}
          onChange={setDraftPurpose}
          options={purposeOptions}
          className="w-full sm:w-48"
        />
        <Select
          value={draftStatus}
          onChange={setDraftStatus}
          options={[
            { value: "", label: "All Status" },
            { value: "new", label: "New" },
            { value: "in_progress", label: "In Progress" },
            { value: "resolved", label: "Resolved" },
          ]}
          className="w-full sm:w-40"
        />
        <Button variant="secondary" onClick={handleApplyFilters}>
          Apply
        </Button>
      </div>

      {hasFilters && (
        <div className="flex-none flex items-center justify-between text-xs px-1">
          <span className="text-secondary">
            Filtered: <strong className="text-theme">{filteredInquiries.length}</strong> inquiries found
          </span>
          <button
            onClick={clearFilters}
            className="text-primary hover:underline font-semibold cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* 3. Table & Content */}
      {!inquiries.length ? (
        <div className="flex-1 min-h-0 flex items-center justify-center bg-surface border border-theme rounded-xl p-8">
          <EmptyState
            title="No customer inquiries yet"
            description="Inquiries submitted by customers from your website contact form will appear here."
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col bg-surface border border-theme rounded-xl overflow-hidden shadow-xs">
          {/* Desktop Table View */}
          <div className="hidden md:block flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead className="bg-primary-light/30 border-b border-theme sticky top-0 z-10 backdrop-blur-sm bg-surface/95">
                <tr>
                  <th className="text-left px-5 py-3.5 font-medium text-theme">Customer</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Contact Number</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Email Address</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Purpose</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Message</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Submitted</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Status</th>
                  <th className="text-right px-5 py-3.5 font-medium text-theme whitespace-nowrap min-w-[90px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-secondary">
                      No inquiries match your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedInquiries.map((inq) => (
                    <tr
                      key={inq.id}
                      className="border-b border-theme last:border-0 hover:bg-primary-light/10 transition-colors"
                    >
                      {/* Customer */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {(inq.name || "C").charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-theme whitespace-nowrap">
                            {inq.name || "Anonymous Guest"}
                          </span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {inq.mobile ? (
                          <a
                            href={`tel:${inq.mobile.replace(/[^0-9+]/g, "")}`}
                            className="inline-flex items-center gap-1.5 text-theme hover:text-primary transition-colors font-medium text-xs sm:text-sm"
                          >
                            <Phone size={13} className="text-secondary" />
                            {inq.mobile}
                          </a>
                        ) : (
                          <span className="text-secondary text-xs">—</span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 max-w-[180px] truncate">
                        {inq.email ? (
                          <a
                            href={`mailto:${inq.email}`}
                            className="inline-flex items-center gap-1.5 text-theme hover:text-primary transition-colors text-xs sm:text-sm truncate"
                            title={inq.email}
                          >
                            <Mail size={13} className="text-secondary shrink-0" />
                            <span className="truncate">{inq.email}</span>
                          </a>
                        ) : (
                          <span className="text-secondary text-xs">—</span>
                        )}
                      </td>

                      {/* Purpose */}
                      <td className="px-4 py-3.5">
                        <PurposeTag purpose={inq.purpose} />
                      </td>

                      {/* Message Preview */}
                      <td className="px-4 py-3.5 text-secondary max-w-xs truncate" title={inq.message}>
                        {inq.message || "—"}
                      </td>

                      {/* Submitted Date */}
                      <td className="px-4 py-3.5 text-secondary whitespace-nowrap text-xs">
                        {formatDate(inq.submittedAt)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={inq.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedId(inq.id)}
                          className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-semibold cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden flex-1 min-h-0 overflow-y-auto divide-y divide-theme">
            {filteredInquiries.length === 0 ? (
              <div className="p-8 text-center text-secondary text-sm">
                No inquiries match your filters.
              </div>
            ) : (
              paginatedInquiries.map((inq) => (
                <div key={inq.id} className="p-4 space-y-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {(inq.name || "C").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-theme">{inq.name || "Anonymous Guest"}</p>
                        <p className="text-xs text-secondary">{inq.mobile || inq.email || "—"}</p>
                      </div>
                    </div>
                    <StatusBadge status={inq.status} />
                  </div>

                  {inq.purpose && <PurposeTag purpose={inq.purpose} />}

                  <p className="text-xs text-secondary line-clamp-2">{inq.message}</p>

                  <div className="flex justify-between items-center pt-1 text-xs">
                    <span className="text-secondary">{formatDate(inq.submittedAt)}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedId(inq.id)}
                      className="text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Pagination */}
          <Pagination
            pagination={pagination}
            totalItems={filteredInquiries.length}
            onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
            onLimitChange={(newLimit) => setPagination({ page: 1, limit: newLimit })}
            itemName="inquiries"
          />
        </div>
      )}

      {/* Details Drawer */}
      <InquiryDetailsDrawer
        inquiry={selectedInquiry}
        onClose={() => setSelectedId(null)}
        onUpdateStatus={updateInquiryStatus}
      />
    </div>
  );
}
