import { useState } from "react";
import { Palette, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { useDesignRequestStore } from "../../../store/designRequestStore";
import Button from "../../../components/ui/Button";
import AIPromptGenerator from "./AIPromptGenerator";
import ContactDesignerModal from "../modals/ContactDesignerModal";
import { DESIGN_REQUEST_STATUS } from "../data/designRequests";

const MAX_VISIBLE_REQUESTS = 5;

function ContactDesignerSection() {
  const requests = useDesignRequestStore((s) => s.requests);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="border border-theme rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
            <Palette size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-theme">Need a professional menu design?</h2>
            <p className="text-sm text-secondary">
              Describe what you need and attach a reference if you have one. Our designer will pick up your request.
            </p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Palette size={16} /> Contact Designer
        </Button>
      </div>

      {requests.length > 0 && (
        <div className="mt-5 border-t border-theme pt-4">
          <p className="text-sm font-medium text-theme mb-3">Your design requests</p>
          <div className="space-y-2">
            {requests.slice(0, MAX_VISIBLE_REQUESTS).map((request) => {
              const status = DESIGN_REQUEST_STATUS[request.status] || DESIGN_REQUEST_STATUS.pending;
              return (
                <div key={request.id} className="flex items-start justify-between gap-3 border border-theme rounded-lg p-3">
                  <div className="min-w-0">
                    <p className="text-sm text-theme line-clamp-2">{request.description}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-secondary">
                      <span>Submitted {format(new Date(request.createdAt), "d MMM yyyy")}</span>
                      {request.attachment && (
                        <span className="inline-flex items-center gap-1">
                          <Paperclip size={12} /> {request.attachment.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${status.className}`}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ContactDesignerModal isOpen={showModal} onClose={() => setShowModal(false)} />
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
