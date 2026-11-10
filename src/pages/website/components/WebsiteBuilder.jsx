import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useWebsiteStore } from "../../../store/websiteStore";
import SubdomainSettings from "./SubdomainSettings";
import WebsiteColorSettings from "./WebsiteColorSettings";
import SectionCard from "./SectionCard";
import HeroEditor from "./editors/HeroEditor";
import AboutEditor from "./editors/AboutEditor";
import MenuEditor from "./editors/MenuEditor";
import OffersEditor from "./editors/OffersEditor";
import GalleryEditor from "./editors/GalleryEditor";
import MapEditor from "./editors/MapEditor";
import InquiryEditor from "./editors/InquiryEditor";
import FooterEditor from "./editors/FooterEditor";
import ReviewsEditor from "./editors/ReviewsEditor";
import GoogleReviewEditor from "./editors/GoogleReviewEditor";
import HoursEditor from "./editors/HoursEditor";

const EDITORS = {
  hero: HeroEditor,
  about: AboutEditor,
  menu: MenuEditor,
  offers: OffersEditor,
  googleReview: GoogleReviewEditor,
  gallery: GalleryEditor,
  reviews: ReviewsEditor,
  hours: HoursEditor,
  map: MapEditor,
  inquiry: InquiryEditor,
  footer: FooterEditor
};

export default function WebsiteBuilder() {
  const { sections, updateSection } = useWebsiteStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const editingId = searchParams.get("section") || searchParams.get("edit") || null;

  const sortedSections = useMemo(() => [...sections].sort((a, b) => a.order - b.order), [sections]);
  const editingSection = sections.find((s) => s.id === editingId) ?? null;

  const handleStartEdit = (sectionId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("section", sectionId);
      return next;
    });
  };

  const handleCancelEdit = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("section");
      next.delete("edit");
      return next;
    });
  };

  const handleSaveSection = (content, extra) => {
    if (!editingSection) return;
    updateSection(editingSection.id, content, extra);
    toast.success(`${editingSection.title} saved`);
    // Keep user on the section editor (do not reset editingId)
  };

  // Editing a section takes over the builder; Back or Cancel returns to the list.
  if (editingSection) {
    const Editor = EDITORS[editingSection.type];
    if (Editor) {
      return (
        <div className="bg-surface border border-theme rounded-xl p-5">
          <Editor section={editingSection} onSave={handleSaveSection} onCancel={handleCancelEdit} />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      <SubdomainSettings />
      <WebsiteColorSettings />

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold text-theme">Website Sections</h2>
          <p className="text-xs text-secondary">Turn sections on or off and edit their content</p>
        </div>
        {sortedSections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            onEdit={(s) => handleStartEdit(s.id)}
          />
        ))}
      </div>
    </div>
  );
}
