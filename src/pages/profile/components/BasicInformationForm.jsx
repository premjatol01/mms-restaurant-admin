import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { useProfileStore } from "../../../store/profileStore";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";
import SelectInput from "./SelectInput";

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
  const restaurantTypeOptions = RESTAURANT_TYPES.map((t) => ({ value: t, label: t }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection title="Basic Information" description="Core details about your restaurant.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Restaurant Name" required error={errors.name?.message} {...register("name")} placeholder="e.g. Spice Garden" />
          <Input label="Tagline" error={errors.tagline?.message} {...register("tagline")} placeholder="e.g. Authentic Indian Flavors" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <SelectInput
            label="Restaurant Type"
            required
            options={restaurantTypeOptions}
            value={watch("restaurantType")}
            onChange={(val) => setValue("restaurantType", val, { shouldValidate: true })}
            error={errors.restaurantType?.message}
            placeholder="Select type"
          />

          <Input label="Establishment Year" error={errors.establishmentYear?.message} {...register("establishmentYear")} placeholder="e.g. 2010" type="number" min="1900" max={new Date().getFullYear()} />
        </div>

        <div className="mt-4">
          <SelectInput
            label="Cuisine Types"
            required
            isMulti
            options={cuisineOptions}
            value={cuisineValues}
            onChange={(val) => setValue("cuisineTypes", val, { shouldValidate: true })}
            error={errors.cuisineTypes?.message}
            placeholder="Select cuisines..."
          />
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