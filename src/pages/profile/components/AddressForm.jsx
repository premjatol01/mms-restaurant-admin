import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { useProfileStore } from "../../../store/profileStore";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";

const schema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  area: z.string().min(1, "Area/Locality is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().min(4, "Enter a valid pincode").max(10),
  landmark: z.string().optional(),
});

export default function AddressForm() {
  const { profile, saveProfile, updateSection, saving } = useProfileStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: profile?.address || {},
  });

  useEffect(() => { if (profile?.address) reset(profile.address); }, [profile, reset]);

  const onSubmit = async (data) => {
    updateSection("address", data);
    const result = await saveProfile({ address: data });
    if (result.success) toast.success("Address updated successfully.");
    else toast.error(result.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection title="Restaurant Address" description="Physical location of your restaurant.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input label="Address Line 1" required error={errors.line1?.message} {...register("line1")} placeholder="Building, Street" />
          </div>
          <div className="md:col-span-2">
            <Input label="Address Line 2" error={errors.line2?.message} {...register("line2")} placeholder="Floor, Suite (optional)" />
          </div>
          <Input label="Area / Locality" required error={errors.area?.message} {...register("area")} placeholder="e.g. Malviya Nagar" />
          <Input label="City" required error={errors.city?.message} {...register("city")} placeholder="e.g. Jaipur" />
          <Input label="State" required error={errors.state?.message} {...register("state")} placeholder="e.g. Rajasthan" />
          <Input label="Country" required error={errors.country?.message} {...register("country")} placeholder="e.g. India" />
          <Input label="Pincode" required error={errors.pincode?.message} {...register("pincode")} placeholder="e.g. 302017" />
          <Input label="Landmark" error={errors.landmark?.message} {...register("landmark")} placeholder="e.g. Near City Mall" />
        </div>
      </FormSection>
      <div className="flex justify-end">
        <Button type="submit" loading={saving}>Save Changes</Button>
      </div>
    </form>
  );
}