import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useWebsiteStore } from "../../../store/websiteStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import InquiryDetailsDrawer, { StatusBadge } from "../modals/InquiryDetailsDrawer";

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 0 && diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

function PurposeTag({ purpose }) {
  if (!purpose) return <span className="text-secondary">-</span>;
  return (
    <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-secondary-soft text-theme whitespace-nowrap">
      {purpose}
    </span>
  );
}

export default function InquiryList() {
  const { inquiries, updateInquiryStatus, getInquiryStats } = useWebsiteStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const stats = getInquiryStats();

  // Read the selected inquiry from the store so the drawer updates after a status change.
  const selectedInquiry = inquiries.find((inq) => inq.id === selectedId) ?? null;

  const purposeOptions = useMemo(() => {
    const purposes = [...new Set(inquiries.map((inq) => inq.purpose).filter(Boolean))];
    return [{ value: "", label: "All Purposes" }, ...purposes.map((p) => ({ value: p, label: p }))];
  }, [inquiries]);

  const filteredInquiries = inquiries.filter((inq) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      inq.name?.toLowerCase().includes(q) ||
      inq.mobile?.includes(search) ||
      inq.email?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || inq.status === statusFilter;
    const matchPurpose = !purposeFilter || inq.purpose === purposeFilter;
    return matchSearch && matchStatus && matchPurpose;
  });

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-theme rounded-xl p-4">
          <p className="text-xs text-secondary">Total Inquiries</p>
          <p className="text-2xl font-bold text-theme">{stats.total}</p>
        </div>
        <div className="bg-surface border border-theme rounded-xl p-4">
          <p className="text-xs text-secondary">New</p>
          <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
        </div>
        <div className="bg-surface border border-theme rounded-xl p-4">
          <p className="text-xs text-secondary">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
        </div>
        <div className="bg-surface border border-theme rounded-xl p-4">
          <p className="text-xs text-secondary">Resolved</p>
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, mobile, or email..."
          />
        </div>
        <Select
          value={purposeFilter}
          onChange={setPurposeFilter}
          options={purposeOptions}
          className="w-full sm:w-48"
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "", label: "All Status" },
            { value: "new", label: "New" },
            { value: "in_progress", label: "In Progress" },
            { value: "resolved", label: "Resolved" }
          ]}
          className="w-full sm:w-40"
        />
      </div>

      {/* List */}
      {filteredInquiries.length === 0 ? (
        <div className="bg-surface border border-theme rounded-xl p-8 text-center">
          <p className="text-secondary">No inquiries found</p>
        </div>
      ) : (
        <div className="bg-surface border border-theme rounded-xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-primary-soft border-b border-theme">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-theme">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-theme">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-theme">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-theme">Purpose</th>
                  <th className="text-left px-4 py-3 font-medium text-theme">Message</th>
                  <th className="text-left px-4 py-3 font-medium text-theme">Submitted</th>
                  <th className="text-left px-4 py-3 font-medium text-theme">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-theme">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inq) => (
                  <tr key={inq.id} className="border-b border-theme last:border-0 hover-bg-primary-soft">
                    <td className="px-4 py-3 font-medium text-theme">{inq.name}</td>
                    <td className="px-4 py-3 text-theme">{inq.mobile}</td>
                    <td className="px-4 py-3 text-theme">{inq.email}</td>
                    <td className="px-4 py-3"><PurposeTag purpose={inq.purpose} /></td>
                    <td className="px-4 py-3 text-secondary max-w-xs truncate">{inq.message}</td>
                    <td className="px-4 py-3 text-secondary">{formatDate(inq.submittedAt)}</td>
                    <td className="px-4 py-3"><StatusBadge status={inq.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedId(inq.id)}
                        className="text-primary hover:underline text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-theme">
            {filteredInquiries.map((inq) => (
              <div key={inq.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-theme">{inq.name}</p>
                    <p className="text-xs text-secondary">{inq.mobile}</p>
                    <p className="text-xs text-secondary">{inq.email}</p>
                  </div>
                  <StatusBadge status={inq.status} />
                </div>
                {inq.purpose && <PurposeTag purpose={inq.purpose} />}
                <p className="text-sm text-secondary line-clamp-2">{inq.message}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-secondary">{formatDate(inq.submittedAt)}</span>
                  <button
                    onClick={() => setSelectedId(inq.id)}
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    View <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
