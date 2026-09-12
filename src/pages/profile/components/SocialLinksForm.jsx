import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { AtSign, Users, Play, Hash, MessageCircle, Link } from "lucide-react";
import { useProfileStore } from "../../../store/profileStore";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";

const urlOrEmpty = z.string().url("Enter a valid URL").optional().or(z.literal(""));

const schema = z.object({
  instagram: urlOrEmpty,
  facebook: urlOrEmpty,
  youtube: urlOrEmpty,
  twitter: urlOrEmpty,
  whatsapp: z.string().optional(),
  other: urlOrEmpty,
});

const SOCIAL_FIELDS = [
  { key: "instagram", label: "Instagram", icon: AtSign, placeholder: "https://instagram.com/yourrestaurant" },
  { key: "facebook", label: "Facebook", icon: Users, placeholder: "https://facebook.com/yourrestaurant" },
  { key: "youtube", label: "YouTube", icon: Play, placeholder: "https://youtube.com/@yourrestaurant" },
  { key: "twitter", label: "X / Twitter", icon: Hash, placeholder: "https://x.com/yourrestaurant" },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, placeholder: "+91 98765 43210" },
  { key: "other", label: "Other Link", icon: Link, placeholder: "https://..." },
];

export default function SocialLinksForm() {
  const { profile, saveProfile, updateSection, saving } = useProfileStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: profile?.socialLinks || {},
  });

  useEffect(() => { if (profile?.socialLinks) reset(profile.socialLinks); }, [profile, reset]);

  const onSubmit = async (data) => {
    updateSection("socialLinks", data);
    const result = await saveProfile({ socialLinks: data });
    if (result.success) toast.success("Social links updated.");
    else toast.error(result.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection title="Social Media Links" description="Add your restaurant's social media profiles.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key} className="flex items-start gap-2">
              <div className="mt-7 text-secondary"><Icon size={18} /></div>
              <div className="flex-1">
                <Input label={label} error={errors[key]?.message} {...register(key)} placeholder={placeholder} />
              </div>
            </div>
          ))}
        </div>
      </FormSection>
      <div className="flex justify-end">
        <Button type="submit" loading={saving}>Save Changes</Button>
      </div>
    </form>
  );
}