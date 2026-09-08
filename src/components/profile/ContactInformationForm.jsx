import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { useProfileStore } from "../../store/profileStore";
import Input from "../ui/Input";
import Button from "../ui/Button";
import FormSection from "../ui/FormSection";

const schema = z.object({
  primaryPhone: z.string().min(10, "Enter a valid phone number").max(15),
  alternatePhone: z.string().max(15).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email address"),
  alternateEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  whatsapp: z.string().max(15).optional().or(z.literal("")),
  supportPhone: z.string().max(15).optional().or(z.literal("")),
});

export default function ContactInformationForm() {
  const { profile, saveProfile, updateSection, saving } = useProfileStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: profile?.contact || {},
  });

  useEffect(() => { if (profile?.contact) reset(profile.contact); }, [profile, reset]);

  const onSubmit = async (data) => {
    updateSection("contact", data);
    const result = await saveProfile({ contact: data });
    if (result.success) toast.success("Contact information updated.");
    else toast.error(result.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection title="Contact Information" description="How customers and staff can reach your restaurant.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Primary Mobile Number" required error={errors.primaryPhone?.message} {...register("primaryPhone")} placeholder="+91 98765 43210" />
          <Input label="Alternate Mobile Number" error={errors.alternatePhone?.message} {...register("alternatePhone")} placeholder="+91 98765 43210" />
          <Input label="Email Address" required type="email" error={errors.email?.message} {...register("email")} placeholder="restaurant@example.com" />
          <Input label="Alternate Email" type="email" error={errors.alternateEmail?.message} {...register("alternateEmail")} placeholder="support@example.com" />
          <Input label="WhatsApp Number" error={errors.whatsapp?.message} {...register("whatsapp")} placeholder="+91 98765 43210" />
          <Input label="Customer Support Number" error={errors.supportPhone?.message} {...register("supportPhone")} placeholder="+91 98765 43210" />
        </div>
      </FormSection>
      <div className="flex justify-end">
        <Button type="submit" loading={saving}>Save Changes</Button>
      </div>
    </form>
  );
}
