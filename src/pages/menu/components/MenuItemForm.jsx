import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { useMenuStore } from "../../../store/menuStore";
import { menuApi } from "../../../api/menu.api";
import Drawer from "../../../components/ui/Drawer";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import ReactSelect from "react-select";
import ImageUploader from "../../../components/ui/ImageUploader";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";

export default function MenuItemForm({ isOpen, onClose, editItem }) {
  const { categories, addMenuItem, updateMenuItem, addCategory } = useMenuStore();
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      price: "",
      image: null,
      isPopular: false,
      status: "available",
    },
  });

  const categoryId = watch("categoryId");
  const isPopular = watch("isPopular");
  const status = watch("status");
  const image = watch("image");

  useEffect(() => {
    if (editItem && isOpen) {
      reset({
        name: editItem.name,
        categoryId: editItem.categoryId || "",
        description: editItem.description || "",
        price: editItem.price?.toString() || "",
        image: editItem.image || null,
        isPopular: !!editItem.isPopular,
        status: editItem.status || "available",
      });
    } else if (isOpen) {
      reset({ name: "", categoryId: "", description: "", price: "", image: null, isPopular: false, status: "available" });
    }
    setShowNewCategory(false);
    setNewCategory("");
  }, [editItem, isOpen, reset]);

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const created = await addCategory({ name: newCategory.trim(), description: "", status: "active" });
      setValue("categoryId", created.id, { shouldValidate: true });
      setNewCategory("");
      setShowNewCategory(false);
      toast.success("Category created successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    }
  };

  const onSubmit = async (data) => {
    try {
      let imageUrl = data.image;
      if (data.image instanceof File) {
        const uploadRes = await menuApi.uploadImage(data.image);
        imageUrl = uploadRes.data.data.url;
      }

      const payload = { ...data, price: Number(data.price), image: imageUrl };
      if (editItem) {
        await updateMenuItem(editItem.id, payload);
        toast.success("Menu item updated successfully.");
      } else {
        await addMenuItem(payload);
        toast.success("Menu item added successfully.");
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save item");
    }
  };

  const categoryOptions = [
    ...categories.map((c) => ({ value: c.id, label: c.name })),
    { value: "__new__", label: "+ Create New Category" },
  ];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={editItem ? "Edit Menu Item" : "Add Menu Item"} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Basic Information">
          <div className="space-y-4">
            <Input
              label="Item Name"
              required
              placeholder="Enter item name"
              {...register("name", { required: "Item name is required" })}
              error={errors.name?.message}
            />
            <div>
              <label className="block text-sm font-medium text-theme mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <Controller
                name="categoryId"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <ReactSelect
                    placeholder="Select category..."
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    value={categoryOptions.find((opt) => opt.value === field.value) || null}
                    onChange={(opt) => {
                      if (opt?.value === "__new__") {
                        setShowNewCategory(true);
                      } else {
                        setShowNewCategory(false);
                        field.onChange(opt?.value || "");
                      }
                    }}
                    options={categoryOptions}
                    className="text-sm"
                    classNamePrefix="select"
                  />
                )}
              />
              {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>}
              
              {showNewCategory && (
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" size="sm" onClick={handleCreateCategory}>Add</Button>
                </div>
              )}
            </div>
            
            <Textarea
              label="Description"
              placeholder="Describe this menu item..."
              {...register("description")}
              rows={3}
            />
            
            <Input
              label="Price"
              required
              type="number"
              placeholder="299"
              {...register("price", { 
                required: "Price is required",
                min: { value: 0.01, message: "Price must be greater than 0" }
              })}
              error={errors.price?.message}
            />
          </div>
        </FormSection>

        <FormSection title="Item Image (Optional)">
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <ImageUploader
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FormSection>

        <FormSection title="Popular Item">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-theme cursor-pointer">
            <input
              type="checkbox"
              {...register("isPopular")}
              className="mt-0.5 w-4 h-4"
              style={{ accentColor: "var(--color-primary)" }}
            />
            <div>
              <p className="text-sm font-medium text-theme flex items-center gap-1.5">
                <Star size={14} className="text-amber-500" fill="currentColor" /> Mark as popular
              </p>
              <p className="text-xs text-secondary">Popular items are featured in the menu section of your restaurant website.</p>
            </div>
          </label>
        </FormSection>

        <FormSection title="Item Status">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="available"
                {...register("status")}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-theme">Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="unavailable"
                {...register("status")}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-theme">Unavailable</span>
            </label>
          </div>
        </FormSection>

        <div className="flex gap-3 pt-4 border-t border-theme">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={isSubmitting}>
            {editItem ? "Save Changes" : "Save Item"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}