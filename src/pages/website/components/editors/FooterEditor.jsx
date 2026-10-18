import { useState } from "react";
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
  Link as LinkIcon
} from "lucide-react";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import Button from "../../../../components/ui/Button";
import EditorShell from "../shared/EditorShell";
import FormBlock from "../shared/FormBlock";
import FieldError from "../shared/FieldError";
import { checkboxClass } from "../shared/fieldStyles";

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
  { id: "map", label: "Location", href: "#map", enabled: true },
  { id: "inquiry", label: "Contact Us", href: "#inquiry", enabled: true }
];

const LINK_ICONS = {
  hero: Home,
  about: Sparkles,
  menu: UtensilsCrossed,
  offers: Tag,
  gallery: Images,
  map: MapPin,
  inquiry: MessageSquare,
};

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: SocialIcons.Instagram, placeholder: "https://instagram.com/yourrestaurant" },
  { key: "facebook", label: "Facebook", icon: SocialIcons.Facebook, placeholder: "https://facebook.com/yourrestaurant" },
  { key: "twitter", label: "X / Twitter", icon: SocialIcons.Twitter, placeholder: "https://x.com/yourrestaurant" },
  { key: "youtube", label: "YouTube", icon: SocialIcons.YouTube, placeholder: "https://youtube.com/@yourrestaurant" },
  { key: "linkedin", label: "LinkedIn", icon: SocialIcons.LinkedIn, placeholder: "https://linkedin.com/company/yourrestaurant" },
  { key: "whatsapp", label: "WhatsApp", icon: SocialIcons.WhatsApp, placeholder: "+91 98765 43210 or https://wa.me/..." }
];

export default function FooterEditor({ section, onSave, onCancel }) {
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

  const [error, setError] = useState("");
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkHref, setNewLinkHref] = useState("");
  const [showAddCustom, setShowAddCustom] = useState(false);

  const handleToggleLink = (index) => {
    setContent((prev) => ({
      ...prev,
      sectionLinks: prev.sectionLinks.map((link, i) =>
        i === index ? { ...link, enabled: !link.enabled } : link
      )
    }));
  };

  const handleLinkChange = (index, field, value) => {
    setContent((prev) => ({
      ...prev,
      sectionLinks: prev.sectionLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const handleRemoveLink = (index) => {
    setContent((prev) => ({
      ...prev,
      sectionLinks: prev.sectionLinks.filter((_, i) => i !== index)
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

  const handleSave = () => {
    if (!content.title.trim()) {
      setError("Enter a section heading or restaurant name");
      return;
    }
    setError("");
    onSave(content);
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
        <FieldError message={error} />
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
        description="Turn section links on or off and customize their display labels"
        action={
          <button
            type="button"
            onClick={handleResetLinks}
            className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors py-1 px-2.5 rounded border border-theme hover:bg-primary-light/30"
            title="Reset to default sections"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
        }
      >
        <div className="space-y-2">
          {content.sectionLinks.map((link, idx) => {
            const IconComponent = LINK_ICONS[link.id] || LinkIcon;
            return (
              <div
                key={link.id || idx}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                  link.enabled ? "bg-surface border-theme" : "bg-primary-light/10 border-theme/40 opacity-60"
                }`}
              >
                <label className="flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={link.enabled}
                    onChange={() => handleToggleLink(idx)}
                    className={checkboxClass}
                    aria-label={`Enable ${link.label}`}
                  />
                </label>

                <div className="p-1 rounded bg-primary-light/30 text-primary shrink-0">
                  <IconComponent size={14} />
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-7">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => handleLinkChange(idx, "label", e.target.value)}
                      placeholder="Link Label"
                      className="w-full px-2.5 py-1 text-xs rounded border border-theme bg-surface text-theme font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="sm:col-span-5 flex items-center gap-1 px-2 py-1 text-xs rounded border border-dashed border-theme bg-primary-light/10 text-secondary truncate font-mono">
                    <span className="text-[10px] uppercase font-bold text-primary">target:</span>
                    <span className="truncate">{link.href}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveLink(idx)}
                  className="p-1 text-secondary hover:text-red-500 rounded transition-colors shrink-0"
                  title="Remove link"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {showAddCustom ? (
          <div className="p-3 rounded-lg border border-primary/40 bg-primary-light/10 space-y-2.5">
            <span className="text-xs font-semibold text-primary block">Add Custom Navigation Link</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
                placeholder="Link Label (e.g. Table Booking)"
                className="px-2.5 py-1.5 text-xs rounded border border-theme bg-surface text-theme focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="text"
                value={newLinkHref}
                onChange={(e) => setNewLinkHref(e.target.value)}
                placeholder="Anchor or URL (e.g. #booking)"
                className="px-2.5 py-1.5 text-xs rounded border border-theme bg-surface text-theme focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button size="xs" variant="secondary" onClick={() => setShowAddCustom(false)}>
                Cancel
              </Button>
              <Button size="xs" onClick={handleAddCustomLink}>
                <Plus size={13} />
                Add Link
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddCustom(true)}
            className="w-full py-2 border border-dashed border-theme rounded-lg text-xs font-medium text-secondary hover:text-primary hover:border-primary hover:bg-primary-light/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            <span>Add Custom Link</span>
          </button>
        )}
      </FormBlock>

      {/* 5. Social Media Links Block */}
      <FormBlock
        title="Social Media Links"
        description="Add your profiles to display clickable social media icons in the footer"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-theme">
                <span className="p-1 rounded bg-primary-light text-primary">
                  <Icon size={13} />
                </span>
                <span>{label}</span>
              </label>
              <input
                type="text"
                value={content.socialLinks?.[key] || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    socialLinks: {
                      ...prev.socialLinks,
                      [key]: e.target.value
                    }
                  }))
                }
                placeholder={placeholder}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}
        </div>
      </FormBlock>
    </EditorShell>
  );
}
