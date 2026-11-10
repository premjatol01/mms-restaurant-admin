import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { useProfileStore } from "../../../store/profileStore";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";
import SelectInput from "./SelectInput";
import { RESTAURANT_TYPES } from "../../../constants/restaurantTypes";

const CUISINE_TYPES = ["Indian", "Chinese", "Italian", "Mexican", "Continental", "North Indian", "South Indian", "Rajasthani", "Fast Food", "Desserts"];

const currentYear = new Date().getFullYear();

const schema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  tagline: z.string().max(100, "Max 100 characters").optional(),
  restaurantType: z.string().min(1, "Restaurant type is required"),
  cuisineTypes: z.array(z.string()).min(1, "Select at least one cuisine"),
  establishmentYear: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => {
      if (val === "" || val === undefined || val === null) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    })
    .refine((val) => val === null || (val >= 1800 && val <= currentYear), {
      message: `Year must be between 1800 and ${currentYear}`,
    }),
});

export default function BasicInformationForm() {
  const { profile, saveProfile, updateProfile, saving } = useProfileStore();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name || "",
      tagline: profile?.tagline || "",
      restaurantType: profile?.restaurantType || "",
      cuisineTypes: profile?.cuisineTypes || [],
      establishmentYear: profile?.establishmentYear || "",
    },
  });

  useEffect(() => {
    if (profile) {
      setValue("name", profile.name || "");
      setValue("tagline", profile.tagline || "");
      setValue("restaurantType", profile.restaurantType || "");
      setValue("cuisineTypes", profile.cuisineTypes || []);
      setValue("establishmentYear", profile.establishmentYear || "");
    }
  }, [profile, setValue]);

  const cuisineValues = watch("cuisineTypes") || [];

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      establishmentYear: data.establishmentYear ? Number(data.establishmentYear) : null,
    };
    updateProfile(payload);
    const result = await saveProfile(payload);
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
      </FormSection>

      <div className="flex justify-end">
        <Button type="submit" loading={saving}>Save Changes</Button>
      </div>
    </form>
  );
}
