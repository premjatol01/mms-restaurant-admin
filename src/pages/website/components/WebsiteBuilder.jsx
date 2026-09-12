import { useState } from "react";
import { ChevronUp, ChevronDown, Edit2, GripVertical, Eye, Save } from "lucide-react";
import { useWebsiteStore } from "../../../store/websiteStore";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import Button from "../../../components/ui/Button";

function SectionCard({ section, onEdit, onMoveUp, onMoveDown, isFirst, isLast }) {
  const { toggleSection } = useWebsiteStore();

  return (
    <div className={`border border-theme rounded-lg p-4 ${section.enabled ? "bg-surface" : "bg-gray-50 opacity-60"}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="cursor-grab text-secondary hover:text-theme">
            <GripVertical size={16} />
          </div>
          <div>
            <h3 className="font-medium text-theme">{section.title}</h3>
            <p className="text-xs text-secondary">{section.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={section.enabled}
              onChange={() => toggleSection(section.id)}
              className="w-4 h-4 rounded border-theme text-primary focus:ring-primary"
            />
            <span className="text-secondary">Enabled</span>
          </label>
          <button
            onClick={() => onMoveUp()}
            disabled={isFirst}
            className="p-1.5 text-secondary hover:text-primary hover:bg-primary-light rounded disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={() => onMoveDown()}
            disabled={isLast}
            className="p-1.5 text-secondary hover:text-primary hover:bg-primary-light rounded disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={() => onEdit(section)}
            className="p-1.5 text-secondary hover:text-primary hover:bg-primary-light rounded"
          >
            <Edit2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroEditor({ section, onSave, onCancel }) {
  const [content, setContent] = useState(section.content);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-theme">Hero Section</h3>
      <Input
        label="Heading"
        value={content.heading}
        onChange={(e) => setContent({ ...content, heading: e.target.value })}
        placeholder="Welcome to Tasty Bites"
      />
      <Textarea
        label="Description"
        value={content.description}
        onChange={(e) => setContent({ ...content, description: e.target.value })}
        placeholder="Experience delicious food..."
        rows={3}
      />
      <Input
        label="Primary Button Text"
        value={content.buttonText}
        onChange={(e) => setContent({ ...content, buttonText: e.target.value })}
        placeholder="View Menu"
      />
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(content)}>Save</Button>
      </div>
    </div>
  );
}

function AboutEditor({ section, onSave, onCancel }) {
  const [content, setContent] = useState(section.content);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-theme">About Section</h3>
      <Input
        label="Title"
        value={content.title}
        onChange={(e) => setContent({ ...content, title: e.target.value })}
        placeholder="About Tasty Bites"
      />
      <Textarea
        label="Description"
        value={content.description}
        onChange={(e) => setContent({ ...content, description: e.target.value })}
        placeholder="Restaurant description..."
        rows={4}
      />
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(content)}>Save</Button>
      </div>
    </div>
  );
}

function MenuEditor({ section, onSave, onCancel }) {
  const [content, setContent] = useState(section.content);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-theme">Menu Section</h3>
      <Input
        label="Section Title"
        value={content.title}
        onChange={(e) => setContent({ ...content, title: e.target.value })}
        placeholder="Our Menu"
      />
      <Textarea
        label="Description"
        value={content.description}
        onChange={(e) => setContent({ ...content, description: e.target.value })}
        placeholder="Explore our delicious menu..."
        rows={3}
      />
      <p className="text-xs text-secondary">Menu items are sourced from your Menu module</p>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(content)}>Save</Button>
      </div>
    </div>
  );
}

function OffersEditor({ section, onSave, onCancel }) {
  const [content, setContent] = useState(section.content);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-theme">Offers Section</h3>
      <Input
        label="Section Title"
        value={content.title}
        onChange={(e) => setContent({ ...content, title: e.target.value })}
        placeholder="Special Offers"
      />
      <Textarea
        label="Description"
        value={content.description}
        onChange={(e) => setContent({ ...content, description: e.target.value })}
        placeholder="Check out our latest deals..."
        rows={3}
      />
      <p className="text-xs text-secondary">Offers are sourced from your Offers & Promotions</p>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(content)}>Save</Button>
      </div>
    </div>
  );
}

function InquiryEditor({ section, onSave, onCancel }) {
  const [content, setContent] = useState(section.content);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-theme">Contact / Inquiry Section</h3>
      <Input
        label="Section Title"
        value={content.title}
        onChange={(e) => setContent({ ...content, title: e.target.value })}
        placeholder="Contact Us"
      />
      <Textarea
        label="Description"
        value={content.description}
        onChange={(e) => setContent({ ...content, description: e.target.value })}
        placeholder="Have a question? Send us an inquiry."
        rows={3}
      />
      <div className="space-y-2">
        <label className="text-sm font-medium text-theme">Form Fields</label>
        <div className="space-y-2">
          {["name", "mobile", "email", "message"].map((field) => (
            <label key={field} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={content.fields?.[field] ?? true}
                onChange={(e) => setContent({
                  ...content,
                  fields: { ...content.fields, [field]: e.target.checked }
                })}
                className="w-4 h-4 rounded border-theme text-primary focus:ring-primary"
              />
              <span className="text-theme capitalize">{field}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(content)}>Save</Button>
      </div>
    </div>
  );
}

export default function WebsiteBuilder() {
  const { sections, updateSection, moveSection, updateBasicInfo, restaurantName, description, phone, email, address } = useWebsiteStore();
  const [editingSection, setEditingSection] = useState(null);
  const [basicInfo, setBasicInfo] = useState({
    restaurantName,
    description,
    phone,
    email,
    address
  });

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const handleSaveSection = (content) => {
    updateSection(editingSection.id, content);
    setEditingSection(null);
  };

  const renderEditor = () => {
    if (!editingSection) return null;
    
    const props = { section: editingSection, onSave: handleSaveSection, onCancel: () => setEditingSection(null) };
    
    switch (editingSection.type) {
      case "hero": return <HeroEditor {...props} />;
      case "about": return <AboutEditor {...props} />;
      case "menu": return <MenuEditor {...props} />;
      case "offers": return <OffersEditor {...props} />;
      case "inquiry": return <InquiryEditor {...props} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-surface border border-theme rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-theme">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Restaurant Name"
            value={basicInfo.restaurantName}
            onChange={(e) => setBasicInfo({ ...basicInfo, restaurantName: e.target.value })}
          />
          <Input
            label="Phone Number"
            value={basicInfo.phone}
            onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={basicInfo.email}
            onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
          />
          <Input
            label="Address"
            value={basicInfo.address}
            onChange={(e) => setBasicInfo({ ...basicInfo, address: e.target.value })}
          />
        </div>
        <Textarea
          label="Short Description"
          value={basicInfo.description}
          onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
          rows={3}
          placeholder="Brief description for your restaurant website..."
        />
        <div className="flex justify-end pt-2">
          <Button onClick={() => updateBasicInfo(basicInfo)}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Section Editor or Section List */}
      {editingSection ? (
        <div className="bg-surface border border-theme rounded-xl p-5">
          {renderEditor()}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="font-semibold text-theme">Website Sections</h2>
          {sortedSections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              onEdit={setEditingSection}
              onMoveUp={() => moveSection(section.id, "up")}
              onMoveDown={() => moveSection(section.id, "down")}
              isFirst={index === 0}
              isLast={index === sortedSections.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}