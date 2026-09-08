import { useProfileStore } from "../../store/profileStore";
import { MapPin, Phone, Mail, Clock, X } from "lucide-react";

export default function ProfilePreview({ onClose }) {
  const { profile } = useProfileStore();
  if (!profile) return null;

  const todayHours = profile.businessHours?.[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const isOpenToday = todayHours?.isOpen;
  const hoursText = isOpenToday && todayHours.slots?.[0]
    ? `${todayHours.slots[0].open} – ${todayHours.slots[0].close}`
    : "Closed today";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div 
        className="rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl"
        style={{ backgroundColor: "var(--color-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover */}
        <div 
          className="relative h-32"
          style={{ 
            background: profile.coverImage ? `url(${profile.coverImage}) center/cover` : "linear-gradient(135deg, var(--color-primary), var(--color-secondary))"
          }}
        >
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center -mt-10 mb-3">
          <div 
            className="w-20 h-20 rounded-xl border-4 overflow-hidden shadow-md"
            style={{ borderColor: "var(--color-surface)", backgroundColor: "var(--color-surface)" }}
          >
            {profile.logo
              ? <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: "var(--color-primary)" }}>{profile.name?.[0] || "R"}</div>}
          </div>
        </div>

        <div className="px-5 pb-5 space-y-3 text-center">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>{profile.name || "Restaurant Name"}</h2>
            {profile.tagline && <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{profile.tagline}</p>}
            <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
              {profile.cuisineTypes?.slice(0, 3).map((c) => (
                <span key={c} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-text)" }}>{c}</span>
              ))}
              {profile.address?.city && <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>• {profile.address.city}</span>}
            </div>
          </div>

          <div className="text-left space-y-2 pt-3" style={{ borderColor: "var(--color-border)" }}>
            {profile.address?.line1 && (
              <div className="flex gap-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                <MapPin size={13} className="flex-shrink-0 mt-0.5" />
                <span>{[profile.address.line1, profile.address.area, profile.address.city].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {profile.contact?.primaryPhone && (
              <div className="flex gap-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                <Phone size={13} className="flex-shrink-0" />
                <span>{profile.contact.primaryPhone}</span>
              </div>
            )}
            {profile.contact?.email && (
              <div className="flex gap-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                <Mail size={13} className="flex-shrink-0" />
                <span>{profile.contact.email}</span>
              </div>
            )}
            <div className="flex gap-2 text-xs">
              <Clock size={13} className="flex-shrink-0" style={{ color: isOpenToday ? "#22c55e" : "#f87171" }} />
              <span style={{ color: isOpenToday ? "#16a34a" : "#dc2626" }}>
                {isOpenToday ? "Open" : "Closed"} • {hoursText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}