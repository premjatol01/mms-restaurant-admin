import { useState } from "react";
import { Search, ChevronRight, X } from "lucide-react";
import { useWebsiteStore } from "../../../store/websiteStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";

function StatusBadge({ status }) {
  const styles = {
    new: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700"
  };
  const labels = { new: "New", in_progress: "In Progress", resolved: "Resolved" };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function InquiryDetailsDrawer({ inquiry, onClose, onUpdateStatus }) {
  if (!inquiry) return null;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-lg h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
          <h2 className="text-lg font-semibold text-theme">Inquiry Details</h2>
          <button onClick={onClose} className="p-1 text-secondary hover:text-theme rounded">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-secondary">Name</p>
              <p className="text-sm font-medium text-theme">{inquiry.name}</p>
            </div>
            <div>
              <p className="text-xs text-secondary">Mobile</p>
              <p className="text-sm text-theme">{inquiry.mobile}</p>
            </div>
            <div>
              <p className="text-xs text-secondary">Email</p>
              <p className="text-sm text-theme">{inquiry.email}</p>
            </div>
            <div>
              <p className="text-xs text-secondary">Message</p>
              <p className="text-sm text-theme whitespace-pre-wrap">{inquiry.message}</p>
            </div>
            <div>
              <p className="text-xs text-secondary">Submitted</p>
              <p className="text-sm text-theme">{formatDate(inquiry.submittedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-secondary mb-2">Status</p>
              <StatusBadge status={inquiry.status} />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-theme space-y-2">
          {inquiry.status === "new" && (
            <Button className="w-full" onClick={() => onUpdateStatus(inquiry.id, "in_progress")}>
              Mark as In Progress
            </Button>
          )}
          {inquiry.status === "in_progress" && (
            <Button className="w-full" onClick={() => onUpdateStatus(inquiry.id, "resolved")}>
              Mark as Resolved
            </Button>
          )}
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function InquiryList() {
  const { inquiries, updateInquiryStatus, getInquiryStats } = useWebsiteStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const stats = getInquiryStats();

  const filteredInquiries = inquiries.filter((inq) => {
    const matchSearch = !search || 
      inq.name.toLowerCase().includes(search.toLowerCase()) ||
      inq.mobile.includes(search) ||
      inq.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || inq.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

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
              <thead className="bg-primary-light/30 border-b border-theme">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-theme">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-theme">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-theme">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-theme">Message</th>
                  <th className="text-left px-4 py-3 font-medium text-theme">Submitted</th>
                  <th className="text-left px-4 py-3 font-medium text-theme">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-theme">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inq) => (
                  <tr key={inq.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10">
                    <td className="px-4 py-3 font-medium text-theme">{inq.name}</td>
                    <td className="px-4 py-3 text-theme">{inq.mobile}</td>
                    <td className="px-4 py-3 text-theme">{inq.email}</td>
                    <td className="px-4 py-3 text-secondary max-w-xs truncate">{inq.message}</td>
                    <td className="px-4 py-3 text-secondary">{formatDate(inq.submittedAt)}</td>
                    <td className="px-4 py-3"><StatusBadge status={inq.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSelectedInquiry(inq)}
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
                <p className="text-sm text-secondary line-clamp-2">{inq.message}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-secondary">{formatDate(inq.submittedAt)}</span>
                  <button 
                    onClick={() => setSelectedInquiry(inq)}
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
      {selectedInquiry && (
        <InquiryDetailsDrawer
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onUpdateStatus={updateInquiryStatus}
        />
      )}
    </div>
  );
}