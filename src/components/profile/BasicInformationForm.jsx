import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import Select from "react-select";
import { useProfileStore } from "../../store/profileStore";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import FormSection from "../ui/FormSection";

const RESTAURANT_TYPES = ["Restaurant", "Café", "Fast Food", "Bakery", "Bar & Restaurant", "Hotel Restaurant", "Food Court", "Other"];
const CUISINE_TYPES = ["Indian", "Chinese", "Italian", "Mexican", "Continental", "North Indian", "South Indian", "Rajasthani", "Fast Food", "Desserts"];

const schema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  tagline: z.string().max(100, "Max 100 characters").optional(),
  shortDescription: z.string().max(200, "Max 200 characters").optional(),
  fullDescription: z.string().max(2000, "Max 2000 characters").optional(),
  restaurantType: z.string().min(1, "Restaurant type is required"),
  cuisineTypes: z.array(z.string()).min(1, "Select at least one cuisine"),
  establishmentYear: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

export default function BasicInformationForm() {
  const { profile, saveProfile, updateProfile, saving } = useProfileStore();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name || "",
      tagline: profile?.tagline || "",
      shortDescription: profile?.shortDescription || "",
      fullDescription: profile?.fullDescription || "",
      restaurantType: profile?.restaurantType || "",
      cuisineTypes: profile?.cuisineTypes || [],
      establishmentYear: profile?.establishmentYear || "",
      status: profile?.status || "active",
    },
  });

  useEffect(() => {
    if (profile) {
      setValue("name", profile.name || "");
      setValue("tagline", profile.tagline || "");
      setValue("shortDescription", profile.shortDescription || "");
      setValue("fullDescription", profile.fullDescription || "");
      setValue("restaurantType", profile.restaurantType || "");
      setValue("cuisineTypes", profile.cuisineTypes || []);
      setValue("establishmentYear", profile.establishmentYear || "");
      setValue("status", profile.status || "active");
    }
  }, [profile, setValue]);

  const shortDesc = watch("shortDescription") || "";
  const fullDesc = watch("fullDescription") || "";
  const cuisineValues = watch("cuisineTypes") || [];

  const onSubmit = async (data) => {
    updateProfile(data);
    const result = await saveProfile(data);
    if (result.success) toast.success("Basic information updated successfully.");
    else toast.error(result.message);
  };

  const cuisineOptions = CUISINE_TYPES.map((c) => ({ value: c, label: c }));
  const selectedCuisines = cuisineOptions.filter((o) => cuisineValues.includes(o.value));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection title="Basic Information" description="Core details about your restaurant.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Restaurant Name" required error={errors.name?.message} {...register("name")} placeholder="e.g. Spice Garden" />
          <Input label="Tagline" error={errors.tagline?.message} {...register("tagline")} placeholder="e.g. Authentic Indian Flavors" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium text-theme block mb-1">Restaurant Type <span className="text-red-500">*</span></label>
            <select
              className={`w-full px-3 py-2 rounded-lg border text-sm text-theme bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] ${errors.restaurantType ? "border-red-400" : "border-theme"}`}
              {...register("restaurantType")}
            >
              <option value="">Select type</option>
              {RESTAURANT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.restaurantType && <p className="text-xs text-red-500 mt-1">{errors.restaurantType.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-theme block mb-1">Establishment Year</label>
            <Input error={errors.establishmentYear?.message} {...register("establishmentYear")} placeholder="e.g. 2010" type="number" min="1900" max={new Date().getFullYear()} />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-theme block mb-1">Cuisine Types <span className="text-red-500">*</span></label>
          <Select
            isMulti
            options={cuisineOptions}
            value={selectedCuisines}
            onChange={(selected) => setValue("cuisineTypes", selected.map((s) => s.value), { shouldValidate: true })}
            placeholder="Select cuisines..."
            classNamePrefix="rs"
            styles={{
              control: (base, state) => ({
                ...base,
                backgroundColor: "var(--color-surface)",
                borderColor: errors.cuisineTypes ? "#f87171" : "var(--color-border)",
                boxShadow: state.isFocused ? "0 0 0 2px var(--color-primary-light)" : "none",
                "&:hover": { borderColor: "var(--color-primary)" },
                fontSize: "0.875rem",
              }),
              menu: (base) => ({ ...base, backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", zIndex: 50 }),
              option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? "var(--color-primary)" : state.isFocused ? "var(--color-primary-light)" : "transparent", color: state.isSelected ? "#fff" : "var(--color-text)", fontSize: "0.875rem" }),
              multiValue: (base) => ({ ...base, backgroundColor: "var(--color-primary-light)" }),
              multiValueLabel: (base) => ({ ...base, color: "var(--color-text)", fontSize: "0.75rem" }),
              input: (base) => ({ ...base, color: "var(--color-text)" }),
              singleValue: (base) => ({ ...base, color: "var(--color-text)" }),
            }}
          />
          {errors.cuisineTypes && <p className="text-xs text-red-500 mt-1">{errors.cuisineTypes.message}</p>}
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-theme block mb-1">Restaurant Status</label>
          <div className="flex gap-4">
            {["active", "inactive"].map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value={s} {...register("status")} className="accent-[var(--color-primary)]" />
                <span className="text-sm text-theme capitalize">{s}</span>
              </label>
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection title="Description">
        <div className="space-y-4">
          <Textarea
            label="Short Description"
            maxLength={200}
            value={shortDesc}
            error={errors.shortDescription?.message}
            {...register("shortDescription")}
            rows={2}
            placeholder="Brief description shown in listings..."
          />
          <Textarea
            label="Full Description"
            maxLength={2000}
            value={fullDesc}
            error={errors.fullDescription?.message}
            {...register("fullDescription")}
            rows={5}
            placeholder="Detailed description of your restaurant..."
          />
        </div>
      </FormSection>

      <div className="flex justify-end">
        <Button type="submit" loading={saving}>Save Changes</Button>
      </div>
    </form>
  );
}
