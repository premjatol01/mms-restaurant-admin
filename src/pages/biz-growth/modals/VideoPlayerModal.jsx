import { X, ExternalLink, Sparkles, Video } from "lucide-react";

const extractYoutubeId = (url) => {
  if (!url || typeof url !== "string") return null;
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function VideoPlayerModal({ isOpen, onClose, resource }) {
  if (!isOpen || !resource) return null;

  const ytId = extractYoutubeId(resource.url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative bg-surface rounded-2xl border border-theme w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-surface">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Video size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-theme truncate">{resource.title}</h3>
              <p className="text-xs text-secondary truncate">
                {resource.sourceName || "YouTube Masterclass"} &bull; {resource.readTime || "Video"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-secondary hover:text-theme hover:bg-primary-soft rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Player */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative aspect-video bg-black w-full">
            {ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white text-center p-6 space-y-3">
                <Video size={36} className="text-white/40" />
                <p className="text-sm">Video could not be embedded directly.</p>
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors"
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Description & Metadata */}
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-soft text-primary border border-primary/20">
                  {resource.category || "General"}
                </span>
                {resource.featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Sparkles size={12} />
                    Featured Pick
                  </span>
                )}
              </div>

              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                >
                  <span>Open Video in New Tab</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>

            {resource.description && (
              <div className="bg-surface-soft rounded-xl p-4 border border-theme text-sm text-theme leading-relaxed">
                <h4 className="font-semibold text-xs text-secondary uppercase tracking-wider mb-1.5">
                  About this resource
                </h4>
                <p className="text-secondary whitespace-pre-line">{resource.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
