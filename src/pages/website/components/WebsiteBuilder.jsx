import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useWebsiteStore } from "../../../store/websiteStore";
import BasicInfoForm from "./BasicInfoForm";
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

const EDITORS = {
  hero: HeroEditor,
  about: AboutEditor,
  menu: MenuEditor,
  offers: OffersEditor,
  gallery: GalleryEditor,
  map: MapEditor,
  inquiry: InquiryEditor
};

export default function WebsiteBuilder() {
  const { sections, updateSection, moveSection } = useWebsiteStore();
  const [editingId, setEditingId] = useState(null);

  const sortedSections = useMemo(() => [...sections].sort((a, b) => a.order - b.order), [sections]);
  const editingSection = sections.find((s) => s.id === editingId) ?? null;

  const handleSaveSection = (content) => {
    updateSection(editingSection.id, content);
    toast.success(`${editingSection.title} saved`);
    setEditingId(null);
  };

  // Editing a section takes over the builder; Back or Cancel returns to the list.
  if (editingSection) {
    const Editor = EDITORS[editingSection.type];
    if (Editor) {
      return (
        <div className="bg-surface border border-theme rounded-xl p-5">
          <Editor section={editingSection} onSave={handleSaveSection} onCancel={() => setEditingId(null)} />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      <BasicInfoForm />
      <SubdomainSettings />
      <WebsiteColorSettings />

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold text-theme">Website Sections</h2>
          <p className="text-xs text-secondary">Turn sections on or off and edit their content</p>
        </div>
        {sortedSections.map((section, index) => (
          <SectionCard
            key={section.id}
            section={section}
            onEdit={(s) => setEditingId(s.id)}
            isFirst={index === 0}
            isLast={index === sortedSections.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
