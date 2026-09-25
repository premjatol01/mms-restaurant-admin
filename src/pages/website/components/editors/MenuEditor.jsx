import { useState } from "react";
import { Star } from "lucide-react";
import EditorShell from "../shared/EditorShell";
import FormBlock from "../shared/FormBlock";
import VegDot from "../shared/VegDot";
import { useMenuItems } from "../../hooks/useMenuItems";
import { checkboxClass } from "../shared/fieldStyles";

export default function MenuEditor({ section, onSave, onCancel }) {
  // Initialize popularItemIds if not present
  const { items } = useMenuItems();
  
  // If popularItemIds is undefined, maybe default to the ones that are popular in the menu store
  const defaultPopular = items.filter(i => i.isPopular).map(i => i.id);
  const initialPopularIds = section.content.popularItemIds || defaultPopular;

  const [content, setContent] = useState({
    ...section.content,
    popularItemIds: initialPopularIds
  });

  const togglePopularItem = (id) => {
    setContent((prev) => {
      const isSelected = prev.popularItemIds.includes(id);
      return {
        ...prev,
        popularItemIds: isSelected
          ? prev.popularItemIds.filter((itemId) => itemId !== id)
          : [...prev.popularItemIds, id]
      };
    });
  };

  const handleSave = () => {
    onSave(content);
  };

  return (
    <EditorShell
      title="Popular Menu Section"
      description="Select the dishes you want to highlight as popular on your website."
      onBack={onCancel}
      onSave={handleSave}
    >
      <FormBlock
        title="Select Popular Dishes"
        description="Choose which menu items should be displayed in the popular menu section."
        action={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-secondary-soft text-theme">
            <Star size={12} />
            {content.popularItemIds.length} selected
          </span>
        }
      >
        <div className="space-y-2 border border-theme rounded-lg p-4 bg-surface max-h-96 overflow-y-auto">
          {items.map((item) => {
            const isSelected = content.popularItemIds.includes(item.id);
            return (
              <label
                key={item.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-primary-light/10 cursor-pointer transition-colors"
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
                {isSelected && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
              </label>
            );
          })}
        </div>
      </FormBlock>
    </EditorShell>
  );
}
