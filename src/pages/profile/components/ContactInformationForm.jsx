import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { useProfileStore } from "../../../store/profileStore";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";

const phone10Regex = /^[6-9]\d{9}$/;

const schema = z.object({
  primaryPhone: z
    .string()
    .min(1, "Primary mobile number is required")
    .transform((val) => (val ? val.replace(/\D/g, "") : ""))
    .refine((val) => phone10Regex.test(val), {
      message: "Please enter a valid 10-digit mobile number (starts with 6-9)",
    }),
  alternatePhone: z
    .string()
    .optional()
    .transform((val) => (val ? val.replace(/\D/g, "") : ""))
    .refine((val) => !val || phone10Regex.test(val), {
      message: "Alternate number must be a valid 10-digit mobile number",
    })
    .or(z.literal("")),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address (e.g. name@example.com)"),
  alternateEmail: z
    .string()
    .optional()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Please enter a valid email address",
    })
    .or(z.literal("")),
  whatsapp: z
    .string()
    .optional()
    .transform((val) => (val ? val.replace(/\D/g, "") : ""))
    .refine((val) => !val || phone10Regex.test(val), {
      message: "WhatsApp number must be a valid 10-digit mobile number",
    })
    .or(z.literal("")),
  supportPhone: z
    .string()
    .optional()
    .transform((val) => (val ? val.replace(/\D/g, "") : ""))
    .refine((val) => !val || phone10Regex.test(val), {
      message: "Support number must be a valid 10-digit mobile number",
    })
    .or(z.literal("")),
});

export default function ContactInformationForm() {
  const { profile, saveProfile, updateSection, saving } = useProfileStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: profile?.contact || {},
  });

  useEffect(() => {
    if (profile?.contact) reset(profile.contact);
  }, [profile, reset]);

  const onSubmit = async (data) => {
    const result = await saveProfile({ contact: data });
    if (result.success) toast.success("Contact information updated.");
    else toast.error(result.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection
        title="Contact Information"
        description="How customers and staff can reach your restaurant. Displayed on your portfolio and invoices."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Primary Mobile Number"
            required
            error={errors.primaryPhone?.message}
            {...register("primaryPhone")}
            placeholder="e.g. 9876543210 (10 digits)"
            maxLength={10}
          />
          <Input
            label="Alternate Mobile Number"
            error={errors.alternatePhone?.message}
            {...register("alternatePhone")}
            placeholder="e.g. 9876543210 (10 digits)"
            maxLength={10}
          />
          <Input
            label="Email Address"
            required
            type="email"
            error={errors.email?.message}
            {...register("email")}
            placeholder="e.g. restaurant@example.com"
          />
          <Input
            label="Alternate Email"
            type="email"
            error={errors.alternateEmail?.message}
            {...register("alternateEmail")}
            placeholder="e.g. support@example.com"
          />
          <Input
            label="WhatsApp Number"
            error={errors.whatsapp?.message}
            {...register("whatsapp")}
            placeholder="e.g. 9876543210 (10 digits)"
            maxLength={10}
          />
          <Input
            label="Customer Support Number"
            error={errors.supportPhone?.message}
            {...register("supportPhone")}
            placeholder="e.g. 9876543210 (10 digits)"
            maxLength={10}
          />
        </div>
      </FormSection>
      <div className="flex justify-end">
        <Button type="submit" loading={saving}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
