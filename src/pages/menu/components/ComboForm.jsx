import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useMenuStore } from "../../../store/menuStore";
import Drawer from "../../../components/ui/Drawer";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import ImageUploader from "../../../components/ui/ImageUploader";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";

export default function ComboForm({ isOpen, onClose, editCombo }) {
  const { menuItems, addCombo, updateCombo } = useMenuStore();
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: null,
    itemIds: [],
    price: "",
    status: "available",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editCombo) {
      setForm({
        name: editCombo.name,
        description: editCombo.description || "",
        image: editCombo.image,
        itemIds: editCombo.itemIds || [],
        price: editCombo.price?.toString() || "",
        status: editCombo.status,
      });
    } else {
      setForm({ name: "", description: "", image: null, itemIds: [], price: "", status: "available" });
    }
    setErrors({});
  }, [editCombo, isOpen]);

  const originalTotal = useMemo(() => {
    return form.itemIds.reduce((sum, id) => {
      const item = menuItems.find((i) => i.id === id);
      return sum + (item?.price || 0);
    }, 0);
  }, [form.itemIds, menuItems]);

  const savings = originalTotal - (Number(form.price) || 0);

  const toggleItem = (itemId) => {
    setForm((prev) => ({
      ...prev,
      itemIds: prev.itemIds.includes(itemId)
        ? prev.itemIds.filter((id) => id !== itemId)
        : [...prev.itemIds, itemId],
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Combo name is required";
    if (form.itemIds.length === 0) errs.itemIds = "Select at least one menu item";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) errs.price = "Valid price is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { ...form, price: Number(form.price) };
    if (editCombo) {
      updateCombo(editCombo.id, payload);
      toast.success("Combo updated successfully.");
    } else {
      addCombo(payload);
      toast.success("Combo created successfully.");
    }
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={editCombo ? "Edit Combo" : "Create Combo"} size="lg">
      <div className="space-y-6">
        <FormSection title="Combo Details">
          <div className="space-y-4">
            <Input
              label="Combo Name"
              required
              placeholder="e.g., Burger Combo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />
            <Textarea
              label="Description"
              placeholder="Describe this combo..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
        </FormSection>

        <FormSection title="Combo Image">
          <ImageUploader
            value={form.image}
            onChange={(img) => setForm({ ...form, image: img })}
          />
        </FormSection>

        <FormSection title="Select Menu Items">
          <div className="space-y-2 max-h-60 overflow-y-auto border border-theme rounded-lg p-2">
            {menuItems.length === 0 ? (
              <p className="text-sm text-secondary p-2">No menu items available. Create menu items first.</p>
            ) : (
              menuItems.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border ${
                    form.itemIds.includes(item.id) ? "border-primary bg-primary-light/20" : "border-transparent hover:bg-primary-light/10"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.itemIds.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-theme">{item.name}</p>
                  </div>
                  <span className="text-sm text-secondary">₹{item.price}</span>
                </label>
              ))
            )}
          </div>
          {errors.itemIds && <p className="text-xs text-red-500 mt-1">{errors.itemIds}</p>}
        </FormSection>

        {form.itemIds.length > 0 && (
          <FormSection title="Selected Items Summary">
            <div className="bg-primary-light/20 rounded-lg p-4 space-y-2">
              {form.itemIds.map((id) => {
                const item = menuItems.find((i) => i.id === id);
                if (!item) return null;
                return (
                  <div key={id} className="flex justify-between text-sm">
                    <span className="text-theme">{item.name}</span>
                    <span className="text-secondary">₹{item.price}</span>
                  </div>
                );
              })}
              <div className="border-t border-theme pt-2 flex justify-between font-medium">
                <span className="text-theme">Original Total</span>
                <span className="text-theme">₹{originalTotal}</span>
              </div>
            </div>
          </FormSection>
        )}

        <FormSection title="Combo Pricing">
          <div className="space-y-4">
            <Input
              label="Combo Price"
              required
              type="number"
              placeholder="399"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              error={errors.price}
            />
            {form.price && originalTotal > 0 && (
              <div className={`text-sm ${savings > 0 ? "text-green-600" : "text-secondary"}`}>
                {savings > 0 ? `You save ₹${savings}` : originalTotal - Number(form.price) < 0 ? "Price is higher than original total" : "No savings"}
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Combo Status">
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
          <Button className="flex-1" onClick={handleSubmit}>{editCombo ? "Save Changes" : "Create Combo"}</Button>
        </div>
      </div>
    </Drawer>
  );
}