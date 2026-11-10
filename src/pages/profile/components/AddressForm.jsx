import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import Select from "react-select";
import { toast } from "sonner";
import { useProfileStore } from "../../../store/profileStore";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";
import { INDIAN_STATES, COUNTRY_OPTIONS, selectCustomStyles } from "../../../constants/addressConstants";

const schema = z.object({
  line1: z.string().optional().default(""),
  line2: z.string().optional().default(""),
  area: z.string().optional().default(""),
  landmark: z.string().optional().default(""),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().min(1, "PIN code is required").regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
});

export default function AddressForm() {
  const { profile, saveProfile, updateSection, saving } = useProfileStore();
  const profileAddr = profile?.address || profile?.detailedAddress || {};

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      line1: profileAddr.line1 !== undefined ? profileAddr.line1 : (profileAddr.houseNumber || ""),
      line2: profileAddr.line2 !== undefined ? profileAddr.line2 : (profileAddr.street !== undefined ? profileAddr.street : ""),
      area: profileAddr.area || "",
      landmark: profileAddr.landmark || "",
      city: profileAddr.city || "",
      state: profileAddr.state || "Rajasthan",
      pincode: profileAddr.pincode || "",
      country: profileAddr.country || "India",
    },
  });

  const selectedState = watch("state");
  const selectedCountry = watch("country") || "India";

  useEffect(() => {
    if (profile?.address || profile?.detailedAddress) {
      const addr = profile.address || profile.detailedAddress;
      reset({
        line1: addr.line1 !== undefined ? addr.line1 : (addr.houseNumber || ""),
        line2: addr.line2 !== undefined ? addr.line2 : (addr.street !== undefined ? addr.street : ""),
        area: addr.area || "",
        landmark: addr.landmark || "",
        city: addr.city || "",
        state: addr.state || "Rajasthan",
        pincode: addr.pincode || "",
        country: addr.country || "India",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data) => {
    const payload = {
      line1: String(data.line1 || "").trim(),
      line2: String(data.line2 || "").trim(),
      area: String(data.area || "").trim(),
      landmark: String(data.landmark || "").trim(),
      city: String(data.city || "").trim(),
      state: String(data.state || "").trim(),
      pincode: String(data.pincode || "").trim(),
      country: String(data.country || "India").trim(),
    };

    const result = await saveProfile({ address: payload });
    if (result.success) {
      toast.success("Restaurant address updated successfully.");
      try {
        const { useWebsiteStore } = await import("../../../store/websiteStore");
        useWebsiteStore.getState().loadProfile();
      } catch {}
    } else {
      toast.error(result.message || "Failed to update address");
    }
  };

  const currentStateOption = INDIAN_STATES.find(
    (s) => s.value.toLowerCase() === (selectedState || "").toLowerCase()
  ) || (selectedState ? { value: selectedState, label: selectedState } : null);

  const currentCountryOption = COUNTRY_OPTIONS.find(
    (c) => c.value.toLowerCase() === (selectedCountry || "India").toLowerCase()
  ) || { value: selectedCountry || "India", label: selectedCountry || "India" };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection
        title="Restaurant Address Details"
        description="Structured address fields matching your website map, customer bills, and super admin records."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="House / Building / Flat No."
              error={errors.line1?.message}
              {...register("line1")}
              placeholder="e.g. Shop 4 / Flat 12 / Plot 45"
            />
          </div>

          <div>
            <Input
              label="Street Address / Road"
              error={errors.line2?.message}
              {...register("line2")}
              placeholder="e.g. Station Road, MG Marg"
            />
          </div>

          <div>
            <Input
              label="Area / Locality"
              error={errors.area?.message}
              {...register("area")}
              placeholder="e.g. Shastri Nagar, Tilak Nagar"
            />
          </div>

          <div>
            <Input
              label="Landmark"
              error={errors.landmark?.message}
              {...register("landmark")}
              placeholder="e.g. Opposite City Hospital"
            />
          </div>

          <div>
            <Input
              label="City"
              required
              error={errors.city?.message}
              {...register("city")}
              placeholder="e.g. Barmer, Jaipur"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme mb-1.5">
              State <span className="text-red-500">*</span>
            </label>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Select
                  options={INDIAN_STATES}
                  value={currentStateOption}
                  onChange={(opt) => field.onChange(opt?.value || "")}
                  placeholder="Select State"
                  styles={selectCustomStyles}
                  isClearable
                />
              )}
            />
            {errors.state?.message && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.state.message}</p>
            )}
          </div>

          <div>
            <Input
              label="PIN Code"
              required
              maxLength={6}
              error={errors.pincode?.message}
              {...register("pincode", {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
                }
              })}
              placeholder="e.g. 344001 (6 digits)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme mb-1.5">
              Country <span className="text-red-500">*</span>
            </label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select
                  options={COUNTRY_OPTIONS}
                  value={currentCountryOption}
                  onChange={(opt) => field.onChange(opt?.value || "India")}
                  styles={selectCustomStyles}
                />
              )}
            />
            {errors.country?.message && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.country.message}</p>
            )}
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end">
        <Button type="submit" loading={saving}>Save Changes</Button>
      </div>
    </form>
  );
}
