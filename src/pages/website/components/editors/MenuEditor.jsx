import { useState } from "react";
import { RotateCcw, Star } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import EditorShell from "../shared/EditorShell";
import FormBlock from "../shared/FormBlock";
import ColorField from "../shared/ColorField";
import ContrastWarning from "../shared/ContrastWarning";
import FieldError from "../shared/FieldError";
import VegDot from "../shared/VegDot";
import MenuPreview from "../MenuPreview";
import FullMenuModal from "../../modals/FullMenuModal";
import { useMenuItems, usePopularMenuItems } from "../../hooks/useMenuItems";
import { DEFAULT_MENU_COLORS, MENU_COLOR_FIELDS } from "../../utils/constants";
import { checkboxClass } from "../shared/fieldStyles";

export default function MenuEditor({ section, onSave, onCancel }) {
  const [content, setContent] = useState(section.content);
  const [errors, setErrors] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);

  const { categories, items } = useMenuItems();
  const popularItems = usePopularMenuItems();
  const colors = content.colors;

  const setColor = (key) => (value) =>
    setContent((c) => ({ ...c, colors: { ...c.colors, [key]: value } }));

  const handleSave = () => {
    const next = {};
    if (!content.title.trim()) next.title = "Enter a section title";
    if (content.showViewAll && !content.viewAllLabel.trim()) next.viewAllLabel = "Enter a label for the button";
    setErrors(next);
    if (Object.keys(next).length === 0) onSave(content);
  };

  return (
    <EditorShell
      title="Popular Menu Section"
      description="Shows the dishes marked Popular in your Menu, with a button to open the full menu"
      onBack={onCancel}
      onSave={handleSave}
    >
      <div>
        <Input
          label="Section Title"
          value={content.title}
          onChange={(e) => setContent((c) => ({ ...c, title: e.target.value }))}
          placeholder="Popular Menu"
        />
        <FieldError message={errors.title} />
      </div>
      <Textarea
        label="Description"
        value={content.description}
        onChange={(e) => setContent((c) => ({ ...c, description: e.target.value }))}
        placeholder="Our most loved dishes..."
        rows={2}
      />

      <FormBlock
        title="Popular dishes"
        description="Taken automatically from your Menu. There is nothing to set up here."
        action={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-secondary-soft text-theme">
            <Star size={12} />
            {popularItems.length} shown
          </span>
        }
      >
        {popularItems.length === 0 ? (
          <p className="text-sm text-secondary">
            No dishes are marked Popular yet. Mark dishes as Popular in the Menu module and they will appear here.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {popularItems.map((item) => (
              <li key={item.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-theme text-theme">
                <VegDot isVeg={item.isVeg} />
                {item.name}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-secondary">
          To change this list, mark or unmark dishes as Popular in the Menu module. Unavailable dishes are hidden automatically.
        </p>
      </FormBlock>

      <FormBlock
        title="View All Menu button"
        description="Opens the full menu in a popup so visitors can browse every dish"
      >
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={content.showViewAll}
            onChange={(e) => setContent((c) => ({ ...c, showViewAll: e.target.checked }))}
            className={checkboxClass}
          />
          <span className="text-theme">Show the View All Menu button</span>
        </label>
        {content.showViewAll && (
          <div>
            <Input
              label="Button label"
              value={content.viewAllLabel}
              onChange={(e) => setContent((c) => ({ ...c, viewAllLabel: e.target.value }))}
              placeholder="View All Menu"
            />
            <FieldError message={errors.viewAllLabel} />
          </div>
        )}
      </FormBlock>

      <FormBlock
        title="Menu colors"
        description="Colors for this section and the full menu popup"
        action={
          <button
            type="button"
            onClick={() => setContent((c) => ({ ...c, colors: { ...DEFAULT_MENU_COLORS } }))}
            className="flex items-center gap-1.5 text-xs text-secondary hover-text-primary"
          >
            <RotateCcw size={14} />
            Reset to default
          </button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MENU_COLOR_FIELDS.map(({ key, label, hint }) => (
            <ColorField key={key} label={label} hint={hint} value={colors[key]} onChange={setColor(key)} />
          ))}
        </div>
        <div className="space-y-1">
          <ContrastWarning foreground={colors.headingText} background={colors.cardBackground} message="Dish names are hard to read on the card background" />
          <ContrastWarning foreground={colors.headingText} background={colors.sectionBackground} message="The section title is hard to read on the section background" />
          <ContrastWarning foreground={colors.priceText} background={colors.cardBackground} message="Prices are hard to read on the card background" />
          <ContrastWarning foreground={colors.accentText} background={colors.accent} message="Text on badges and buttons is hard to read" />
        </div>
      </FormBlock>

      <FormBlock
        title="Preview"
        description={content.showViewAll ? "Select the button to see the full menu popup" : "How this section will look on your website"}
      >
        <MenuPreview
          title={content.title}
          description={content.description}
          items={popularItems}
          colors={colors}
          showViewAll={content.showViewAll}
          viewAllLabel={content.viewAllLabel}
          onViewAll={() => setMenuOpen(true)}
        />
      </FormBlock>

      <FullMenuModal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Our Menu"
        categories={categories}
        items={items}
        colors={colors}
      />
    </EditorShell>
  );
}
