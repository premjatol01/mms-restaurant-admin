import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useMenuStore } from "../../../store/menuStore";
import Drawer from "../../../components/ui/Drawer";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import Select from "../../../components/ui/Select";
import ImageUploader from "../../../components/ui/ImageUploader";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";

export default function MenuItemForm({ isOpen, onClose, editItem }) {
  const { categories, addMenuItem, updateMenuItem, addCategory } = useMenuStore();
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    description: "",
    price: "",
    image: null,
    status: "available",
  });
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        categoryId: editItem.categoryId || "",
        description: editItem.description || "",
        price: editItem.price?.toString() || "",
        image: editItem.image,
        status: editItem.status,
      });
    } else {
      setForm({ name: "", categoryId: "", description: "", price: "", image: null, status: "available" });
    }
    setShowNewCategory(false);
    setNewCategory("");
    setErrors({});
  }, [editItem, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Item name is required";
    if (!form.categoryId) errs.categoryId = "Category is required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) errs.price = "Valid price is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCategoryChange = (val) => {
    if (val === "__new__") {
      setShowNewCategory(true);
    } else {
      setForm({ ...form, categoryId: val });
    }
  };

  const handleCreateCategory = () => {
    if (!newCategory.trim()) return;
    const newCatId = `cat-${Date.now()}`;
    addCategory({ id: newCatId, name: newCategory.trim(), description: "", status: "active" });
    setForm({ ...form, categoryId: newCatId });
    setNewCategory("");
    setShowNewCategory(false);
    toast.success("Category created successfully.");
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { ...form, price: Number(form.price) };
    if (editItem) {
      updateMenuItem(editItem.id, payload);
      toast.success("Menu item updated successfully.");
    } else {
      addMenuItem(payload);
      toast.success("Menu item added successfully.");
    }
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={editItem ? "Edit Menu Item" : "Add Menu Item"} size="md">
      <div className="space-y-6">
        <FormSection title="Basic Information">
          <div className="space-y-4">
            <Input
              label="Item Name"
              required
              placeholder="Enter item name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />
            <div>
              <Select
                label="Category"
                required
                value={form.categoryId}
                onChange={handleCategoryChange}
                options={[
                  { value: "", label: "Select category" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                  { value: "__new__", label: "+ Create New Category" },
                ]}
                error={errors.categoryId}
              />
              {showNewCategory && (
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleCreateCategory}>Add</Button>
                </div>
              )}
            </div>
            <Textarea
              label="Description"
              placeholder="Describe this menu item..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
            <Input
              label="Price"
              required
              type="number"
              placeholder="299"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              error={errors.price}
            />
          </div>
        </FormSection>

        <FormSection title="Item Image">
          <ImageUploader
            value={form.image}
            onChange={(img) => setForm({ ...form, image: img })}
          />
        </FormSection>

        <FormSection title="Item Status">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={form.status === "available"}
                onChange={() => setForm({ ...form, status: "available" })}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-theme">Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={form.status === "unavailable"}
                onChange={() => setForm({ ...form, status: "unavailable" })}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-theme">Unavailable</span>
            </label>
          </div>
        </FormSection>

        <div className="flex gap-3 pt-4 border-t border-theme">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit}>{editItem ? "Save Changes" : "Save Item"}</Button>
        </div>
      </div>
    </Drawer>
  );
}