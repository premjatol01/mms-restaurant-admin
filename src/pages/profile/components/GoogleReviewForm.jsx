import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, Star } from "lucide-react";
import { useProfileStore } from "../../../store/profileStore";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";

// Google review links come in a few shapes: g.page/r/.../review, search.google.com/local/writereview,
// maps.app.goo.gl/..., google.com / google.co.in maps URLs.
// The Google domain must END the hostname (google.com, google.co.in, google.com.au, google.de),
// so lookalikes such as google.com.evil.io don't pass.
const GOOGLE_HOST = /(^|\.)(google\.(com|co\.[a-z]{2}|com\.[a-z]{2}|[a-z]{2})|g\.page|goo\.gl|g\.co)$/i;

const isGoogleLink = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && GOOGLE_HOST.test(url.hostname);
  } catch {
    return false;
  }
};

const schema = z.object({
  googleReviewLink: z
    .string()
    .trim()
    .refine((v) => v === "" || isGoogleLink(v), "Enter a valid Google review link, starting with https://"),
});

export default function GoogleReviewForm() {
  const { profile, saveProfile, updateProfile, saving } = useProfileStore();
  const savedLink = profile?.googleReviewLink || "";

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { googleReviewLink: savedLink },
  });

  useEffect(() => { reset({ googleReviewLink: profile?.googleReviewLink || "" }); }, [profile?.googleReviewLink, reset]);

  const typed = (useWatch({ control, name: "googleReviewLink" }) || "").trim();
  const previewable = !!typed && isGoogleLink(typed);

  const save = async (link, message) => {
    const data = { googleReviewLink: link };
    updateProfile(data);
    const result = await saveProfile(data);
    if (result.success) toast.success(message);
    else toast.error(result.message);
  };

  const onSubmit = (data) => save(data.googleReviewLink.trim(), savedLink ? "Google review link updated." : "Google review link saved.");

  const onRemove = () => save("", "Google review link removed.");

  const copyLink = () => {
    navigator.clipboard.writeText(typed);
    toast.success("Review link copied to clipboard.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection
        title="Google Review Link"
        description="Customers are sent to this link from the ordering page to leave a Google review for your restaurant."
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <div className="mt-7 text-secondary"><Star size={18} /></div>
            <div className="flex-1">
              <Input
                label="Review Link"
                error={errors.googleReviewLink?.message}
                {...register("googleReviewLink")}
                placeholder="https://g.page/r/your-restaurant/review"
              />
            </div>
          </div>

          {previewable && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-theme border border-theme">
              <Star size={16} className="text-secondary flex-shrink-0" />
              <span className="text-sm text-theme flex-1 truncate">{typed}</span>
              <button type="button" onClick={copyLink} className="text-secondary hover:text-theme transition-colors" title="Copy link">
                <Copy size={15} />
              </button>
              <a href={typed} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-theme transition-colors" title="Test link">
                <ExternalLink size={15} />
              </a>
            </div>
          )}

          <p className="text-xs text-secondary">
            To find your link, open your Google Business Profile, choose <strong>Get more reviews</strong>, and copy the share link.
            Leave this empty if you don't want to ask customers for reviews.
          </p>
        </div>
      </FormSection>

      <div className="flex justify-end gap-2">
        {savedLink && (
          <Button type="button" variant="ghost" onClick={onRemove} disabled={saving}>Remove Link</Button>
        )}
        <Button type="submit" loading={saving}>{savedLink ? "Update Link" : "Save Link"}</Button>
      </div>
    </form>
  );
}
