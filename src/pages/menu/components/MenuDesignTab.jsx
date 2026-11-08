import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Palette, Paperclip, UtensilsCrossed, QrCode, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useDesignRequestStore } from "../../../store/designRequestStore";
import Button from "../../../components/ui/Button";
import AIPromptGenerator from "./AIPromptGenerator";
import ContactDesignerModal from "../modals/ContactDesignerModal";
import { DESIGN_REQUEST_STATUS } from "../data/designRequests";

const MAX_VISIBLE_REQUESTS = 4;

function ContactDesignerSection() {
  const { requests, fetchRequests } = useDesignRequestStore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRequests(true);
  }, [fetchRequests]);

  return (
    <div className="border border-theme rounded-xl p-5 bg-surface">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
            <Palette size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-theme">Need a professional menu or QR design?</h2>
            <p className="text-sm text-secondary">
              Describe your theme or upload reference files. Our direct design team will craft customized assets for you.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/design-requests"
            className="text-xs font-semibold text-primary hover:underline px-3 py-2 rounded-lg hover:bg-primary-light transition-colors inline-flex items-center gap-1"
          >
            <span>Track Requests</span>
            <ArrowRight size={14} />
          </Link>
          <Button onClick={() => setShowModal(true)}>
            <Palette size={16} /> Request Design
          </Button>
        </div>
      </div>

      {requests.length > 0 && (
        <div className="mt-5 border-t border-theme pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-theme">Recent Design Requests</p>
            <Link
              to="/design-requests"
              className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>View all ({requests.length})</span>
              <ExternalLink size={12} />
            </Link>
          </div>
          
          <div className="space-y-2.5">
            {requests.slice(0, MAX_VISIBLE_REQUESTS).map((request) => {
              const status = DESIGN_REQUEST_STATUS[request.status] || DESIGN_REQUEST_STATUS.pending;
              const isMenu = request.requestType === "Menu Design" || !request.requestType;

              return (
                <div key={request.id} className="flex items-start justify-between gap-3 border border-theme rounded-lg p-3 hover:border-theme/80 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isMenu ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"
                      }`}>
                        {isMenu ? <UtensilsCrossed size={12} /> : <QrCode size={12} />}
                        {request.requestType || "Menu Design"}
                      </span>
                      {request.title && (
                        <span className="text-xs font-semibold text-theme truncate">{request.title}</span>
                      )}
                    </div>
                    <p className="text-xs text-secondary line-clamp-1">{request.description}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-secondary">
                      <span>Submitted {format(new Date(request.createdAt), "d MMM yyyy")}</span>
                      {request.attachment && (
                        <span className="inline-flex items-center gap-1">
                          <Paperclip size={11} /> {request.attachment.name}
                        </span>
                      )}
                      {request.status === "completed" && (
                        <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                          <CheckCircle2 size={11} /> Ready to download
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${status.className}`}>
                      {status.label}
                    </span>
                    <Link
                      to="/design-requests"
                      className="text-xs text-primary hover:underline font-medium"
                      title="View full request and download design"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showModal && (
        <ContactDesignerModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          initialRequestType="Menu Design"
        />
      )}
    </div>
  );
}

export default function MenuDesignTab() {
  return (
    <div className="space-y-6">
      <AIPromptGenerator />
      <ContactDesignerSection />
    </div>
  );
}
