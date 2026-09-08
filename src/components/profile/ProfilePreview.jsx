import { useProfileStore } from "../../store/profileStore";
import { MapPin, Phone, Mail, Clock, Globe } from "lucide-react";

export default function ProfilePreview({ onClose }) {
  const { profile } = useProfileStore();
  if (!profile) return null;

  const todayHours = profile.businessHours?.[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const isOpenToday = todayHours?.isOpen;
  const hoursText = isOpenToday && todayHours.slots?.[0]
    ? `${todayHours.slots[0].open} – ${todayHours.slots[0].close}`
    : "Closed today";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Cover */}
        <div className="relative h-32 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
          {profile.coverImage && <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />}
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center text-xs hover:bg-black/50">✕</button>
        </div>

        {/* Logo */}
        <div className="flex justify-center -mt-10 mb-3">
          <div className="w-20 h-20 rounded-xl border-4 border-surface bg-surface overflow-hidden shadow-md">
            {profile.logo
              ? <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold text-xl">{profile.name?.[0] || "R"}</div>}
          </div>
        </div>

        <div className="px-5 pb-5 space-y-3 text-center">
          <div>
            <h2 className="text-lg font-bold text-theme">{profile.name || "Restaurant Name"}</h2>
            {profile.tagline && <p className="text-xs text-secondary">{profile.tagline}</p>}
            <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
              {profile.cuisineTypes?.slice(0, 3).map((c) => (
                <span key={c} className="text-xs bg-primary-light text-theme px-2 py-0.5 rounded-full">{c}</span>
              ))}
              {profile.address?.city && <span className="text-xs text-secondary">• {profile.address.city}</span>}
            </div>
          </div>

          <div className="text-left space-y-2 border-t border-theme pt-3">
            {profile.address?.line1 && (
              <div className="flex gap-2 text-xs text-secondary">
                <MapPin size={13} className="flex-shrink-0 mt-0.5" />
                <span>{[profile.address.line1, profile.address.area, profile.address.city].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {profile.contact?.primaryPhone && (
              <div className="flex gap-2 text-xs text-secondary">
                <Phone size={13} className="flex-shrink-0" />
                <span>{profile.contact.primaryPhone}</span>
              </div>
            )}
            {profile.contact?.email && (
              <div className="flex gap-2 text-xs text-secondary">
                <Mail size={13} className="flex-shrink-0" />
                <span>{profile.contact.email}</span>
              </div>
            )}
            <div className="flex gap-2 text-xs">
              <Clock size={13} className={`flex-shrink-0 ${isOpenToday ? "text-green-500" : "text-red-400"}`} />
              <span className={isOpenToday ? "text-green-600" : "text-red-400"}>
                {isOpenToday ? "Open" : "Closed"} • {hoursText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
