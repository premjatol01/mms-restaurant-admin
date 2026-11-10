import { useState } from "react";
import { Star, Copy, ExternalLink, Sparkles, MessageSquareHeart } from "lucide-react";
import { toast } from "sonner";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import EditorShell from "../shared/EditorShell";
import FormBlock from "../shared/FormBlock";

const GOOGLE_HOST = /(^|\.)(google\.(com|co\.[a-z]{2}|com\.[a-z]{2}|[a-z]{2})|g\.page|goo\.gl|g\.co)$/i;

const isGoogleLink = (value) => {
  if (!value || typeof value !== "string") return false;
  try {
    const url = new URL(value.trim());
    return (url.protocol === "https:" || url.protocol === "http:") && GOOGLE_HOST.test(url.hostname);
  } catch {
    return false;
  }
};

export default function GoogleReviewEditor({ section, onSave, onCancel }) {
  const [heading, setHeading] = useState(
    section.content?.heading || "Loved your experience with us?"
  );
  const [description, setDescription] = useState(
    section.content?.description ||
      "Help us grow and let others know about your dining experience by leaving a 5-star review on Google."
  );
  const [buttonText, setButtonText] = useState(
    section.content?.buttonText || "Review Us on Google"
  );
  const [googleReviewLink, setGoogleReviewLink] = useState(
    section.content?.googleReviewLink || ""
  );

  const trimmedLink = googleReviewLink.trim();
  const isValidLink = Boolean(trimmedLink && isGoogleLink(trimmedLink));

  const copyLink = () => {
    if (!trimmedLink) return;
    navigator.clipboard.writeText(trimmedLink);
    toast.success("Google review link copied to clipboard.");
  };

  const handleSave = () => {
    const trimmedHeading = heading.trim() || "Loved your experience with us?";
    const trimmedDesc = description.trim();
    const trimmedBtnText = buttonText.trim() || "Review Us on Google";

    const updatedContent = {
      ...section.content,
      heading: trimmedHeading,
      description: trimmedDesc,
      buttonText: trimmedBtnText,
      googleReviewLink: trimmedLink
    };

    onSave(updatedContent, {
      enabled: section.enabled,
      title: section.title || "Google Review",
      description: trimmedHeading
    });
  };

  return (
    <EditorShell
      title="Google Review Banner"
      description="Configure a prominent banner inviting guests to rate and review your restaurant on Google."
      onBack={onCancel}
      onSave={handleSave}
    >
      {/* ───────────────── 1. BANNER CONTENT ───────────────── */}
      <FormBlock
        title="Banner Information"
        description="Customize the headline, subtitle description, and call-to-action button text."
      >
        <div className="space-y-4">
          <Input
            label="Banner Heading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="e.g. Loved your experience with us?"
            required
          />

          <Textarea
            label="Banner Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Help us grow and let others know about your dining experience by leaving a 5-star review on Google."
            rows={3}
          />

          <Input
            label="Button Text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="e.g. Review Us on Google"
          />
        </div>
      </FormBlock>

      {/* ───────────────── 2. GOOGLE REVIEW LINK ───────────────── */}
      <FormBlock
        title="Google Review URL"
        description="Provide the direct link where diners can leave a review on your Google Business Profile."
      >
        <div className="space-y-3">
          <Input
            label="Google Review Link"
            value={googleReviewLink}
            onChange={(e) => setGoogleReviewLink(e.target.value)}
            placeholder="https://g.page/r/your-business/review or https://maps.app.goo.gl/..."
            error={
              trimmedLink && !isValidLink
                ? "Please enter a valid Google link starting with https:// (e.g., https://g.page/r/... or https://maps.app.goo.gl/...)"
                : undefined
            }
          />

          {trimmedLink && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-theme">
              <Star size={16} className="text-amber-500 fill-amber-400 flex-shrink-0" />
              <span className="text-sm text-theme flex-1 truncate font-mono">{trimmedLink}</span>
              <button
                type="button"
                onClick={copyLink}
                className="p-1.5 text-secondary hover:text-theme transition-colors rounded hover:bg-primary-soft"
                title="Copy link"
              >
                <Copy size={15} />
              </button>
              <a
                href={trimmedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-secondary hover:text-theme transition-colors rounded hover:bg-primary-soft"
                title="Test review link"
              >
                <ExternalLink size={15} />
              </a>
            </div>
          )}

          <p className="text-xs text-secondary">
            Tip: Open your <strong>Google Business Profile</strong>, click <strong>Ask for reviews</strong>, and paste the short share link here.
          </p>
        </div>
      </FormBlock>

      {/* ───────────────── 3. LIVE BANNER PREVIEW ───────────────── */}
      <FormBlock
        title="Banner Preview"
        description="Preview of how this banner appears on your restaurant website."
      >
        <div className="p-6 sm:p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-soft/40 via-surface to-surface shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 text-center sm:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} className="fill-amber-400 text-amber-500" />
                  ))}
                </div>
                <span>Google Reviews</span>
              </div>

              <h4 className="text-xl sm:text-2xl font-bold text-theme">
                {heading || "Loved your experience with us?"}
              </h4>

              <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                {description ||
                  "Help us grow and let others know about your dining experience by leaving a 5-star review on Google."}
              </p>
            </div>

            <div className="shrink-0">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-md shadow-primary/20">
                <Star size={16} className="fill-current" />
                <span>{buttonText || "Review Us on Google"}</span>
                <ExternalLink size={14} />
              </div>
            </div>
          </div>
        </div>
      </FormBlock>
    </EditorShell>
  );
}
