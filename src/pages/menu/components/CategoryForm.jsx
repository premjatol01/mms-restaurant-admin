import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useMenuStore } from "../../../store/menuStore";
import { menuApi } from "../../../api/menu.api";
import Drawer from "../../../components/ui/Drawer";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import ImageUploader from "../../../components/ui/ImageUploader";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";

export default function CategoryForm({ isOpen, onClose, editCategory }) {
  const { addCategory, updateCategory } = useMenuStore();
  const [form, setForm] = useState({ name: "", description: "", image: null, status: "active", isTopCategory: false });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editCategory) {
      setForm({
        name: editCategory.name || "",
        description: editCategory.description || "",
        image: editCategory.image || editCategory.imageUrl || null,
        status: editCategory.status || "active",
        isTopCategory: Boolean(editCategory.isTopCategory),
      });
    } else {
      setForm({ name: "", description: "", image: null, status: "active", isTopCategory: false });
    }
    setErrors({});
  }, [editCategory, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Category name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      let imageUrl = form.image;
      if (form.image instanceof File) {
        const uploadRes = await menuApi.uploadImage(form.image);
        imageUrl = uploadRes.data.data.url;
      }
      
      const payload = { ...form, image: imageUrl };

      if (editCategory) {
        await updateCategory(editCategory.id, payload);
        toast.success("Category updated successfully.");
      } else {
        await addCategory(payload);
        toast.success("Category added successfully.");
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category");
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={editCategory ? "Edit Category" : "Add Category"} size="sm">
      <div className="space-y-6">
        <FormSection title="Category Details">
          <div className="space-y-4">
            <Input
              label="Category Name"
              required
              placeholder="e.g., Starters"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />
            <Textarea
              label="Description"
              placeholder="Brief description of this category..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
        </FormSection>

        <FormSection title="Category Image (Optional)">
          <ImageUploader
            value={form.image}
            onChange={(img) => setForm({ ...form, image: img })}
          />
        </FormSection>

        <FormSection title="Status">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={form.status === "active"}
                onChange={() => setForm({ ...form, status: "active" })}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-theme">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={form.status === "inactive"}
                onChange={() => setForm({ ...form, status: "inactive" })}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-theme">Inactive</span>
            </label>
          </div>
        </FormSection>

        <FormSection title="Top 5 Categories Feature">
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-theme bg-primary-light/10 hover:bg-primary-light/20 transition-colors">
            <input
              type="checkbox"
              checked={form.isTopCategory}
              onChange={(e) => setForm({ ...form, isTopCategory: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary border-theme"
            />
            <div>
              <span className="text-sm font-medium text-theme flex items-center gap-1.5">
                <Star size={14} className="fill-amber-400 text-amber-500" /> Feature in Top 5 Categories
              </span>
              <p className="text-xs text-secondary mt-0.5">
                Display this category in the top 5 featured categories on the customer order portal.
              </p>
            </div>
          </label>
        </FormSection>

        <div className="flex gap-3 pt-4 border-t border-theme">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit}>{editCategory ? "Save Changes" : "Save Category"}</Button>
        </div>
      </div>
    </Drawer>
  );
}