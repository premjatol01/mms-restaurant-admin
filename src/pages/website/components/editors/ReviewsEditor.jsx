import { useState, useEffect } from "react";
import { Star, MessageSquareQuote, Check, X, ShieldCheck, LoaderCircle } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import EditorShell from "../shared/EditorShell";
import FormBlock from "../shared/FormBlock";
import { checkboxClass } from "../shared/fieldStyles";
import { reviewsApi } from "../../../../api/reviews.api";

export default function ReviewsEditor({ section, onSave, onCancel }) {
  const [title, setTitle] = useState(
    section.content?.title || section.title || "Customer Reviews"
  );
  const [description, setDescription] = useState(
    section.content?.description || section.description || "What our guests say about their dining experience"
  );
  const [enabled, setEnabled] = useState(Boolean(section.enabled !== false));

  // Optional live preview data of actual guest reviews
  const [reviewsData, setReviewsData] = useState({ reviews: [], total: 0, averageRating: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchRecentReviews = async () => {
      setLoading(true);
      try {
        const res = await reviewsApi.list({ page: 1, pageSize: 4 });
        if (isMounted && res.data?.data) {
          const list = res.data.data.reviews || [];
          const stats = res.data.data.stats || {};
          const avg = stats.averageRating || 0;
          setReviewsData({
            reviews: list,
            total: res.data.data.total || 0,
            averageRating: avg ? Number(avg).toFixed(1) : "0.0"
          });
        }
      } catch (err) {
        console.warn("Could not load reviews preview:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRecentReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = () => {
    const trimmedTitle = title.trim() || "Customer Reviews";
    const trimmedDesc = description.trim();

    const updatedContent = {
      ...section.content,
      title: trimmedTitle,
      description: trimmedDesc,
      enabled
    };

    onSave(updatedContent, {
      enabled,
      title: trimmedTitle,
      description: trimmedDesc
    });
  };

  return (
    <EditorShell
      title="Customer Reviews Section"
      description="Configure customer reviews and ratings to showcase social proof on your website."
      onBack={onCancel}
      onSave={handleSave}
    >
      {/* ───────────────── 1. SECTION CONTENT ───────────────── */}
      <FormBlock
        title="Section Information"
        description="Set the headline and descriptive subtitle for the reviews section."
      >
        <div className="space-y-4">
          <Input
            label="Section Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Customer Reviews"
          />

          <Textarea
            label="Section Subtitle / Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What our guests say about their dining experience"
            rows={2}
          />
        </div>
      </FormBlock>

      {/* ───────────────── 2. WEBSITE VISIBILITY (ENABLE / DISABLE) ───────────────── */}
      <FormBlock
        title="Section Visibility"
        description="Choose whether the Customer Reviews section should be displayed on your live website."
      >
        <div
          onClick={() => setEnabled((prev) => !prev)}
          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
            enabled
              ? "border-primary bg-primary-light/20 shadow-sm"
              : "border-theme bg-surface hover:bg-surface-soft"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className={checkboxClass}
            />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-theme">
                  Enable Reviews Section on Website
                </p>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    enabled
                      ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {enabled ? <Check size={12} /> : <X size={12} />}
                  {enabled ? "Visible on Web" : "Hidden from Web"}
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                When enabled, genuine guest reviews and star ratings are prominently featured on your portfolio page.
              </p>
            </div>
          </div>
        </div>
      </FormBlock>

      {/* ───────────────── 3. LIVE REVIEWS PREVIEW ───────────────── */}
      <FormBlock
        title="Diner Feedback Overview"
        description="Real-time ratings and recent feedback collected from your diners."
        action={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/50">
            <Star size={13} className="fill-amber-400 text-amber-500" />
            {reviewsData.averageRating} Rating ({reviewsData.total} {reviewsData.total === 1 ? "Review" : "Reviews"})
          </span>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-8 text-secondary text-sm gap-2 border border-theme rounded-lg bg-surface">
            <LoaderCircle size={18} className="animate-spin text-primary" />
            <span>Loading reviews preview...</span>
          </div>
        ) : reviewsData.reviews.length === 0 ? (
          <div className="py-8 text-center text-secondary text-sm space-y-1.5 border border-theme rounded-lg bg-surface p-4">
            <MessageSquareQuote size={28} className="mx-auto text-secondary/40 mb-1" />
            <p className="font-medium text-theme">No customer reviews yet</p>
            <p className="text-xs max-w-sm mx-auto">
              When diners submit feedback after scanning table QR codes, their verified reviews will automatically appear here and on your website.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reviewsData.reviews.map((r) => (
              <div
                key={r.id || r._id}
                className="p-3.5 rounded-xl border border-theme bg-surface space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-theme truncate">
                      {r.customerName || (r.customerMobile ? `User ${r.customerMobile.slice(-4)}` : "Guest")}
                    </p>
                    <div className="flex items-center gap-0.5 shrink-0 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={s <= r.rating ? "fill-amber-400 text-amber-500" : "text-gray-300 dark:text-gray-600"}
                        />
                      ))}
                    </div>
                  </div>

                  {r.tableName && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-secondary mt-0.5">
                      <ShieldCheck size={11} className="text-green-600" />
                      Table {r.tableName}
                    </span>
                  )}

                  {r.comment ? (
                    <p className="text-xs text-secondary mt-1.5 line-clamp-2 italic">
                      &quot;{r.comment}&quot;
                    </p>
                  ) : (
                    <p className="text-xs text-secondary/60 mt-1.5 italic">
                      No written comment left.
                    </p>
                  )}
                </div>

                <div className="text-[11px] text-secondary/70 pt-2 border-t border-theme/50">
                  {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "Recent visit"}
                </div>
              </div>
            ))}
          </div>
        )}
      </FormBlock>
    </EditorShell>
  );
}
