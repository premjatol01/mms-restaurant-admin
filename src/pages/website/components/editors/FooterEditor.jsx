import { useState, useMemo } from "react";
import {
  RotateCcw,
  Plus,
  Trash2,
  Home,
  UtensilsCrossed,
  Sparkles,
  Tag,
  Images,
  MapPin,
  MessageSquare,
  Clock,
  Star,
  Link as LinkIcon
} from "lucide-react";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import EditorShell from "../shared/EditorShell";
import FormBlock from "../shared/FormBlock";
import FieldError from "../shared/FieldError";
import { checkboxClass } from "../shared/fieldStyles";
import { useWebsiteStore } from "../../../../store/websiteStore";

// SVG Social Icons
const SocialIcons = {
  Instagram: ({ size = 16, className = "" }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  ),
  Facebook: ({ size = 16, className = "" }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  Twitter: ({ size = 16, className = "" }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
    </svg>
  ),
  YouTube: ({ size = 16, className = "" }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
      <polygon points="10 15 15 12 10 9 10 15"/>
    </svg>
  ),
  LinkedIn: ({ size = 16, className = "" }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  WhatsApp: ({ size = 16, className = "" }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/>
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>
    </svg>
  ),
};

export const DEFAULT_SECTION_LINKS = [
  { id: "hero", label: "Home", href: "#hero", enabled: true },
  { id: "about", label: "About Us", href: "#about", enabled: true },
  { id: "menu", label: "Menu", href: "#menu", enabled: true },
  { id: "offers", label: "Special Offers", href: "#offers", enabled: true },
  { id: "gallery", label: "Gallery", href: "#gallery", enabled: true },
  { id: "reviews", label: "Reviews", href: "#reviews", enabled: true },
  { id: "hours", label: "Opening Hours", href: "#hours", enabled: true },
  { id: "map", label: "Location", href: "#map", enabled: true },
  { id: "inquiry", label: "Contact Us", href: "#inquiry", enabled: true }
];

const LINK_ICONS = {
  hero: Home,
  about: Sparkles,
  menu: UtensilsCrossed,
  offers: Tag,
  gallery: Images,
  reviews: Star,
  hours: Clock,
  map: MapPin,
  inquiry: MessageSquare,
};

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: SocialIcons.Instagram, placeholder: "https://instagram.com/yourrestaurant or handle" },
  { key: "facebook", label: "Facebook", icon: SocialIcons.Facebook, placeholder: "https://facebook.com/yourrestaurant" },
  { key: "twitter", label: "X / Twitter", icon: SocialIcons.Twitter, placeholder: "https://x.com/yourrestaurant" },
  { key: "youtube", label: "YouTube", icon: SocialIcons.YouTube, placeholder: "https://youtube.com/@yourrestaurant" },
  { key: "linkedin", label: "LinkedIn", icon: SocialIcons.LinkedIn, placeholder: "https://linkedin.com/company/yourrestaurant" },
  { key: "whatsapp", label: "WhatsApp", icon: SocialIcons.WhatsApp, placeholder: "10-digit mobile number (e.g. 9876543210)", isPhone: true }
];

export default function FooterEditor({ section, onSave, onCancel }) {
  const storeSections = useWebsiteStore((s) => s.sections);
  const initialContent = section?.content || {};

  const [content, setContent] = useState({
    title: initialContent.title || "Tasty Bites",
    subtitle: initialContent.subtitle !== undefined ? initialContent.subtitle : "Authentic Indian Flavors",
    description: initialContent.description || "Serving delicious food crafted with passion and fresh ingredients.",
    socialLinks: {
      instagram: initialContent.socialLinks?.instagram || "",
      facebook: initialContent.socialLinks?.facebook || "",
      twitter: initialContent.socialLinks?.twitter || "",
      youtube: initialContent.socialLinks?.youtube || "",
      linkedin: initialContent.socialLinks?.linkedin || "",
      whatsapp: initialContent.socialLinks?.whatsapp || ""
    },
    sectionLinks: (initialContent.sectionLinks && Array.isArray(initialContent.sectionLinks) && initialContent.sectionLinks.length > 0)
      ? initialContent.sectionLinks
      : DEFAULT_SECTION_LINKS
  });

  const [errors, setErrors] = useState({});
  const [socialErrors, setSocialErrors] = useState({});
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkHref, setNewLinkHref] = useState("");
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Active section IDs from website store (sections where enabled !== false)
  const activeSectionIds = useMemo(() => {
    return new Set(
      storeSections
        .filter((s) => s.enabled !== false)
        .map((s) => s.id || s.sectionId || s.type)
    );
  }, [storeSections]);

  // Filter section links: show only sections that are active in builder, plus any custom links
  const activeSectionLinks = useMemo(() => {
    return content.sectionLinks.filter((link) => {
      if (!link) return false;
      // If it's a custom link (id starts with custom-), always show
      if (link.id?.startsWith("custom-")) return true;
      // If it corresponds to a store section, only show if that section is active
      const secKey = link.id || link.href?.replace(/^#/, "");
      return activeSectionIds.has(secKey);
    });
  }, [content.sectionLinks, activeSectionIds]);

  const handleToggleLink = (targetId) => {
    setContent((prev) => ({
      ...prev,
      sectionLinks: prev.sectionLinks.map((link) =>
        link.id === targetId ? { ...link, enabled: !link.enabled } : link
      )
    }));
  };

  const handleLinkChange = (targetId, field, value) => {
    setContent((prev) => ({
      ...prev,
      sectionLinks: prev.sectionLinks.map((link) =>
        link.id === targetId ? { ...link, [field]: value } : link
      )
    }));
  };

  const handleRemoveLink = (targetId) => {
    setContent((prev) => ({
      ...prev,
      sectionLinks: prev.sectionLinks.filter((link) => link.id !== targetId)
    }));
  };

  const handleResetLinks = () => {
    setContent((prev) => ({
      ...prev,
      sectionLinks: DEFAULT_SECTION_LINKS
    }));
  };

  const handleAddCustomLink = () => {
    if (!newLinkLabel.trim()) return;
    const href = newLinkHref.trim() || `#${newLinkLabel.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const newLink = {
      id: `custom-${Date.now()}`,
      label: newLinkLabel.trim(),
      href,
      enabled: true
    };
    setContent((prev) => ({
      ...prev,
      sectionLinks: [...prev.sectionLinks, newLink]
    }));
    setNewLinkLabel("");
    setNewLinkHref("");
    setShowAddCustom(false);
  };

  const handleSocialChange = (key, val) => {
    let cleanVal = val;
    if (key === "whatsapp") {
      // If user typing digits, restrict to max 10 digits
      if (!val.startsWith("http")) {
        cleanVal = val.replace(/\D/g, "").slice(0, 10);
      }
    }
    setContent((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [key]: cleanVal
      }
    }));
    if (socialErrors[key]) {
      setSocialErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleSave = () => {
    const errs = {};
    if (!content.title.trim()) {
      errs.title = "Enter a section heading or restaurant name";
    }

    const sErrs = {};
    const sl = content.socialLinks || {};

    // WhatsApp validation: 10-digit mobile or wa.me URL
    if (sl.whatsapp && sl.whatsapp.trim()) {
      const wa = sl.whatsapp.trim();
      if (wa.startsWith("http://") || wa.startsWith("https://")) {
        try {
          new URL(wa);
        } catch {
          sErrs.whatsapp = "Please enter a valid WhatsApp URL";
        }
      } else {
        const digits = wa.replace(/\D/g, "");
        if (digits.length !== 10) {
          sErrs.whatsapp = "WhatsApp mobile number must be exactly 10 digits";
        }
      }
    }

    // URL validation for other social links
    ["instagram", "facebook", "twitter", "youtube", "linkedin"].forEach((k) => {
      const v = (sl[k] || "").trim();
      if (v) {
        if (v.includes(" ")) {
          sErrs[k] = "URL cannot contain spaces";
        } else if (v.startsWith("http://") || v.startsWith("https://")) {
          try {
            new URL(v);
          } catch {
            sErrs[k] = "Please enter a valid URL (e.g. https://...)";
          }
        }
      }
    });

    setErrors(errs);
    setSocialErrors(sErrs);

    if (Object.keys(errs).length === 0 && Object.keys(sErrs).length === 0) {
      onSave(content);
    }
  };

  return (
    <EditorShell
      title="Footer Section"
      description="Configure branding, subtitle, social media profiles, and navigation links"
      onBack={onCancel}
      onSave={handleSave}
    >
      {/* 1. Brand Title */}
      <div>
        <Input
          label="Heading / Restaurant Name"
          value={content.title}
          onChange={(e) => setContent((c) => ({ ...c, title: e.target.value }))}
          placeholder="e.g. Urban Cafe"
        />
        <FieldError message={errors.title} />
      </div>

      {/* 2. Dynamic Subtitle */}
      <div>
        <Input
          label="Subtitle"
          value={content.subtitle}
          onChange={(e) => setContent((c) => ({ ...c, subtitle: e.target.value }))}
          placeholder="e.g. Authentic Indian Flavors"
          hint="Displays directly beneath the restaurant name in your website footer"
        />
      </div>

      {/* 3. Description / Tagline */}
      <div>
        <Textarea
          label="Description / Bio"
          value={content.description}
          onChange={(e) => setContent((c) => ({ ...c, description: e.target.value }))}
          placeholder="Brief intro about your food, story or dining experience..."
          rows={3}
        />
      </div>

      {/* 4. Section Navigation Links Block */}
      <FormBlock
        title="Section Navigation Links"
        description="Showing active sections from your website builder. Toggle links on or off or customize their display labels."
        action={
          <button
            type="button"
            onClick={handleResetLinks}
            className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors py-1 px-2.5 rounded-lg border border-theme hover:bg-primary-soft/10 cursor-pointer"
            title="Reset to default sections"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
        }
      >
        <div className="space-y-2">
          {activeSectionLinks.map((link) => {
            const IconComponent = LINK_ICONS[link.id] || LinkIcon;
            return (
              <div
                key={link.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                  link.enabled ? "bg-surface border-theme" : "bg-primary-soft/10 border-theme/40 opacity-60"
                }`}
              >
                <label className="flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={link.enabled}
                    onChange={() => handleToggleLink(link.id)}
                    className={checkboxClass}
                    aria-label={`Enable ${link.label}`}
                  />
                </label>

                <div className="p-1 rounded-md bg-primary-soft/20 text-primary shrink-0">
                  <IconComponent size={14} />
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-7">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => handleLinkChange(link.id, "label", e.target.value)}
                      placeholder="Link Label"
                      className="w-full px-2.5 py-1 text-xs rounded border border-theme bg-surface text-theme font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="sm:col-span-5 flex items-center gap-1 px-2 py-1 text-xs rounded border border-dashed border-theme bg-primary-soft/10 text-secondary truncate font-mono">
                    <span className="text-[10px] uppercase font-bold text-primary">target:</span>
                    <span className="truncate">{link.href}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveLink(link.id)}
                  className="p-1 text-secondary hover:text-red-500 rounded transition-colors shrink-0 cursor-pointer"
                  title="Remove link"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Polished Add Custom Link Card */}
        {showAddCustom ? (
          <div className="p-4 rounded-xl border border-primary/30 bg-primary-soft/10 shadow-xs space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme flex items-center gap-1.5">
                <LinkIcon size={14} className="text-primary" />
                Add Custom Navigation Link
              </span>
              <span className="text-[11px] text-secondary">
                Points to an anchor (#section) or external URL
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">
                  Link Label
                </label>
                <input
                  type="text"
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  placeholder="e.g. Table Booking, Party Hall"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">
                  Target (Anchor or URL)
                </label>
                <input
                  type="text"
                  value={newLinkHref}
                  onChange={(e) => setNewLinkHref(e.target.value)}
                  placeholder="e.g. #booking or https://..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary font-mono shadow-xs"
                />
              </div>
            </div>
            <div className="flex items-center gap-2.5 justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowAddCustom(false);
                  setNewLinkLabel("");
                  setNewLinkHref("");
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-theme text-secondary hover:text-theme hover:bg-surface-soft transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomLink}
                disabled={!newLinkLabel.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              >
                <Plus size={13} />
                <span>Add Link</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddCustom(true)}
            className="w-full mt-3 py-2.5 border-2 border-dashed border-theme hover:border-primary rounded-xl text-xs font-semibold text-secondary hover:text-primary hover:bg-primary-soft/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Custom Navigation Link</span>
          </button>
        )}
      </FormBlock>

      {/* 5. Social Media Links Block with Validation */}
      <FormBlock
        title="Social Media Links"
        description="Add your profiles to display clickable social media icons in the footer"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon, placeholder, isPhone }) => (
            <div key={key} className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-theme">
                <span className="p-1 rounded bg-primary-soft/20 text-primary">
                  <Icon size={13} />
                </span>
                <span>{label}</span>
                {isPhone && (
                  <span className="text-[10px] text-secondary font-normal ml-auto">
                    (10 digits)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={content.socialLinks?.[key] || ""}
                onChange={(e) => handleSocialChange(key, e.target.value)}
                placeholder={placeholder}
                maxLength={isPhone ? 14 : undefined}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
              {socialErrors[key] && <FieldError message={socialErrors[key]} />}
            </div>
          ))}
        </div>
      </FormBlock>
    </EditorShell>
  );
}
