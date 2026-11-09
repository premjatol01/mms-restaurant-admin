import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { 
  Palette, 
  Plus, 
  UtensilsCrossed, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Paperclip, 
  Download, 
  Eye, 
  RefreshCw,
  ExternalLink,
  Sparkles,
  X
} from "lucide-react";
import { useDesignRequestStore } from "../../store/designRequestStore";
import Button from "../../components/ui/Button";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";
import ContactDesignerModal from "../menu/modals/ContactDesignerModal";
import { getImageUrl } from "../../utils/getImageUrl";

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/50",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/50",
    icon: RefreshCw,
  },
  completed: {
    label: "Completed & Ready",
    badgeClass: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 border-green-200 dark:border-green-800/50",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Declined",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800/50",
    icon: XCircle,
  },
};

export default function DesignRequestsPage() {
  const { requests, loading, fetchRequests } = useDesignRequestStore();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("Menu Design");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchRequests(true);
  }, [fetchRequests]);

  const handleOpenModal = (type = "Menu Design") => {
    setModalType(type);
    setShowModal(true);
  };

  const handleDownloadAsset = (url, filename) => {
    if (!url) return;
    const fullUrl = getImageUrl(url);
    const link = document.createElement("a");
    link.href = fullUrl;
    link.download = filename || "completed-design.png";
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        req.description?.toLowerCase().includes(q) ||
        req.title?.toLowerCase().includes(q);
      const matchType = !typeFilter || req.requestType === typeFilter;
      const matchStatus = !statusFilter || req.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [requests, search, typeFilter, statusFilter]);

  const metrics = useMemo(() => {
    const total = requests.length;
    const menuCount = requests.filter((r) => r.requestType === "Menu Design" || !r.requestType).length;
    const qrCount = requests.filter((r) => r.requestType === "QR Template Design").length;
    const completedCount = requests.filter((r) => r.status === "completed").length;
    const inProgressCount = requests.filter((r) => r.status === "in_progress" || r.status === "pending").length;
    return { total, menuCount, qrCount, completedCount, inProgressCount };
  }, [requests]);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setStatusFilter("");
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full space-y-5">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-theme rounded-xl p-4">
          <p className="text-xs font-medium text-secondary">Total Requests</p>
          <p className="text-2xl font-bold text-theme mt-1">{metrics.total}</p>
        </div>

        <div className="bg-surface border border-theme rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-secondary">Menu Designs</p>
            <UtensilsCrossed size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-theme mt-1">{metrics.menuCount}</p>
        </div>

        <div className="bg-surface border border-theme rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-secondary">QR Template Designs</p>
            <QrCode size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-theme mt-1">{metrics.qrCount}</p>
        </div>

        <div className="bg-surface border border-theme rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-secondary">Completed & Ready</p>
            <CheckCircle2 size={16} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{metrics.completedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by title or description..."
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "", label: "All Request Types" },
              { value: "Menu Design", label: "Menu Design" },
              { value: "QR Template Design", label: "QR Template Design" },
            ]}
            className="w-full sm:w-48"
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "", label: "All Status" },
              { value: "pending", label: "Pending Review" },
              { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
              { value: "rejected", label: "Declined" },
            ]}
            className="w-full sm:w-44"
          />

          {(search || typeFilter || statusFilter) && (
            <Button variant="ghost" onClick={clearFilters} className="text-xs">
              Clear
            </Button>
          )}

          <Button onClick={() => handleOpenModal("Menu Design")}>
            <Plus size={16} />
            <span>Request Design</span>
          </Button>
        </div>
      </div>

      {/* Requests List */}
      <div className="flex-1 min-h-0">
        {loading && requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-surface border border-theme rounded-2xl text-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-secondary">Loading your design requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-surface border border-theme rounded-2xl p-12 text-center">
            <EmptyState
              icon={Palette}
              title={search || typeFilter || statusFilter ? "No matching requests found" : "No design requests yet"}
              description={
                search || typeFilter || statusFilter
                  ? "Try clearing filters to view all requests."
                  : "Need a high-impact menu layout or branded QR table standee? Submit a design request and our direct designer team will craft it for you."
              }
              actionLabel={search || typeFilter || statusFilter ? "Clear Filters" : "+ Request First Design"}
              onAction={search || typeFilter || statusFilter ? clearFilters : () => handleOpenModal("Menu Design")}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRequests.map((req) => {
              const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;
              const isMenu = req.requestType === "Menu Design" || !req.requestType;
              const hasCompletedAsset = req.status === "completed" && req.completedAttachment?.url;

              return (
                <div
                  key={req.id}
                  className="bg-surface border border-theme rounded-2xl p-5 shadow-xs transition-all hover:border-theme/80 space-y-4"
                >
                  {/* Card Top Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          isMenu
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        }`}
                      >
                        {isMenu ? <UtensilsCrossed size={14} /> : <QrCode size={14} />}
                        {req.requestType || "Menu Design"}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusCfg.badgeClass}`}
                      >
                        <StatusIcon size={12} />
                        {statusCfg.label}
                      </span>
                    </div>

                    <span className="text-xs text-secondary">
                      Submitted on {format(new Date(req.createdAt), "d MMM yyyy, h:mm a")}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    {req.title && (
                      <h3 className="text-base font-semibold text-theme mb-1">
                        {req.title}
                      </h3>
                    )}
                    <p className="text-sm text-theme/90 whitespace-pre-line leading-relaxed">
                      {req.description}
                    </p>
                  </div>

                  {/* Initial Reference File (if any) */}
                  {req.attachment && (
                    <div className="flex items-center gap-2 text-xs text-secondary bg-primary-light/20 border border-theme/40 rounded-lg p-2.5 max-w-md">
                      <Paperclip size={14} className="text-primary shrink-0" />
                      <span className="truncate font-medium text-theme">{req.attachment.name}</span>
                      <a
                        href={getImageUrl(req.attachment.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto text-primary hover:underline font-semibold flex items-center gap-1 shrink-0"
                      >
                        <span>View Reference</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  {/* COMPLETED RESULT & CONFIRMATION SECTION */}
                  {req.status === "completed" && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4.5 space-y-3.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-green-600 dark:text-green-400 shrink-0" />
                          <h4 className="text-sm font-bold text-green-800 dark:text-green-300">
                            Design Completed & Ready for Download
                          </h4>
                        </div>
                        {req.completedAt && (
                          <span className="text-xs text-green-700 dark:text-green-400">
                            Fulfilled on {format(new Date(req.completedAt), "d MMM yyyy")}
                          </span>
                        )}
                      </div>

                      {/* Designer Remarks / Confirmation Message */}
                      {req.adminRemarks && (
                        <div className="text-xs text-theme/90 bg-white/70 dark:bg-black/30 border border-green-500/20 rounded-lg p-3">
                          <p className="font-semibold text-green-800 dark:text-green-300 mb-0.5">
                            Designer Confirmation Note:
                          </p>
                          <p className="italic">{req.adminRemarks}</p>
                        </div>
                      )}

                      {/* Completed Asset Display */}
                      {hasCompletedAsset ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface border border-theme rounded-xl p-3.5 shadow-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Thumbnail */}
                            <div
                              onClick={() => setPreviewImage(getImageUrl(req.completedAttachment.url))}
                              className="w-14 h-14 rounded-lg border border-theme overflow-hidden bg-primary-light flex items-center justify-center shrink-0 cursor-pointer group relative"
                              title="Click to preview full size"
                            >
                              <img
                                src={getImageUrl(req.completedAttachment.url)}
                                alt="Completed design"
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Eye size={16} />
                              </div>
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-theme truncate">
                                {req.completedAttachment.name || "Completed Design File"}
                              </p>
                              <p className="text-xs text-secondary mt-0.5">
                                High resolution asset ready for printing or digital display
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setPreviewImage(getImageUrl(req.completedAttachment.url))}
                              className="flex-1 sm:flex-initial"
                            >
                              <Eye size={14} /> Full View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDownloadAsset(req.completedAttachment.url, req.completedAttachment.name)}
                              className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Download size={14} /> Download Design
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-green-700 dark:text-green-400 italic">
                          Confirmation: Design completed. Check your email or platform notification for additional files.
                        </div>
                      )}
                    </div>
                  )}

                  {/* IN PROGRESS STATUS BANNER */}
                  {req.status === "in_progress" && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <Sparkles size={16} className="text-blue-500 shrink-0" />
                      <span>
                        Our design team is actively working on your draft. Once completed, your finalized design file and confirmation will appear right here.
                      </span>
                    </div>
                  )}

                  {/* PENDING STATUS BANNER */}
                  {req.status === "pending" && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <Clock size={16} className="text-amber-600 shrink-0" />
                      <span>
                        Request received in queue. Our design lead will review your specifications shortly.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showModal && (
        <ContactDesignerModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          initialRequestType={modalType}
        />
      )}

      {/* Full-resolution Image Lightbox Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative max-w-4xl max-h-[90vh] bg-surface border border-theme rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-theme bg-surface">
              <span className="text-sm font-semibold text-theme">Design Asset Preview</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleDownloadAsset(previewImage, "design-asset.png")}
                >
                  <Download size={14} /> Download
                </Button>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 text-secondary hover:text-theme rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-auto flex items-center justify-center max-h-[calc(90vh-4rem)] bg-black/10">
              <img
                src={previewImage}
                alt="Full resolution preview"
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
