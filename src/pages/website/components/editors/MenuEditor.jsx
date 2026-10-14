import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Star } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import EditorShell from "../shared/EditorShell";
import FormBlock from "../shared/FormBlock";
import VegDot from "../shared/VegDot";
import { useMenuItems } from "../../hooks/useMenuItems";
import { checkboxClass } from "../shared/fieldStyles";

export default function MenuEditor({ section, onSave, onCancel }) {
  const { items, loading } = useMenuItems();

  // Show only available items that the restaurant admin added in their db
  const availableItems = useMemo(() => {
    return items.filter((item) => item.isAvailable);
  }, [items]);

  // Default popular item IDs from available menu items marked isPopular in the menu
  const defaultPopular = useMemo(() => {
    return availableItems.filter((i) => i.isPopular).map((i) => i.id);
  }, [availableItems]);

  const [content, setContent] = useState(() => ({
    ...section.content,
    title: section.content?.title || "Popular Menu",
    description: section.content?.description || "Our most loved dishes, picked by our guests",
    popularItemIds: section.content?.popularItemIds ?? []
  }));

  // If section had no saved popularItemIds, initialize with available items marked as popular
  useEffect(() => {
    if (
      (!section.content?.popularItemIds || section.content.popularItemIds.length === 0) &&
      defaultPopular.length > 0 &&
      (!content.popularItemIds || content.popularItemIds.length === 0)
    ) {
      setContent((prev) => ({
        ...prev,
        popularItemIds: defaultPopular
      }));
    }
  }, [defaultPopular, section.content?.popularItemIds]);

  const togglePopularItem = (id) => {
    setContent((prev) => {
      const currentIds = prev.popularItemIds || [];
      const isSelected = currentIds.includes(id);
      return {
        ...prev,
        popularItemIds: isSelected
          ? currentIds.filter((itemId) => itemId !== id)
          : [...currentIds, id]
      };
    });
  };

  const handleSave = () => {
    onSave(content);
  };

  const selectedCount = (content.popularItemIds || []).filter((id) =>
    availableItems.some((item) => item.id === id)
  ).length;

  return (
    <EditorShell
      title="Popular Menu Section"
      description="Select the dishes you want to highlight as popular on your website."
      onBack={onCancel}
      onSave={handleSave}
    >
      <Input
        label="Section Title"
        value={content.title || ""}
        onChange={(e) => setContent((c) => ({ ...c, title: e.target.value }))}
        placeholder="Popular Menu"
      />
      <Textarea
        label="Description"
        value={content.description || ""}
        onChange={(e) => setContent((c) => ({ ...c, description: e.target.value }))}
        placeholder="Our most loved dishes, picked by our guests"
        rows={2}
      />

      <FormBlock
        title="Select Popular Dishes"
        description="Choose which available menu items should be displayed in the popular menu section."
        action={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-secondary-soft text-theme">
            <Star size={12} />
            {selectedCount} selected
          </span>
        }
      >
        <div className="space-y-2 border border-theme rounded-lg p-4 bg-surface max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-secondary text-sm gap-2">
              <LoaderCircle size={18} className="animate-spin text-primary" />
              <span>Loading menu items...</span>
            </div>
          ) : availableItems.length === 0 ? (
            <div className="py-8 text-center text-secondary text-sm space-y-1">
              <p className="font-medium text-theme">No available menu items found.</p>
              <p className="text-xs">
                Please add items in the Menu module and ensure their status is &quot;Available&quot;.
              </p>
            </div>
          ) : (
            availableItems.map((item) => {
              const isSelected = (content.popularItemIds || []).includes(item.id);
              return (
                <label
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-primary-light/10 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => togglePopularItem(item.id)}
                      className={checkboxClass}
                    />
                    <div className="flex items-center gap-2">
                      <VegDot isVeg={item.isVeg} />
                      <div>
                        <p className="text-sm font-medium text-theme">{item.name}</p>
                        <p className="text-xs text-secondary">₹{item.price}</p>
                      </div>
                    </div>
                  </div>
                  {isSelected && <Star size={16} className="text-amber-500 fill-amber-500" />}
                </label>
              );
            })
          )}
        </div>
      </FormBlock>
    </EditorShell>
  );
}
