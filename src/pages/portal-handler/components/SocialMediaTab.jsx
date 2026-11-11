import React from "react";
import {
  Globe,
  Phone,
  MessageCircle,
  Star,
  Wifi,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { usePortalHandlerStore } from "../../../store/portalHandlerStore";
import Button from "../../../components/ui/Button";
import {
  InstagramIcon,
  FacebookIcon,
  TwitterXIcon,
  YoutubeIcon,
} from "./SocialBrandIcons";

export default function SocialMediaTab() {
  const {
    portalData,
    updateSocialField,
    toggleSocialChannel,
    updateWifiSettings,
    updateFollowIncentive,
  } = usePortalHandlerStore();

  const { socialMedia } = portalData;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-surface rounded-xl border border-theme p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-theme">
              Social Media & Table Connectivity Handler
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Connect your official social channels, Google Reviews link, WhatsApp support, and guest Wi-Fi credentials shown on the mobile portal.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Social Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Instagram Profile */}
        <div className="bg-surface rounded-xl border border-theme p-4 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <InstagramIcon size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-theme">Instagram</h4>
                <p className="text-[11px] text-secondary">
                  Display feed handle & follow prompts
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleSocialChannel("instagram")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                socialMedia.instagram.enabled
                  ? "bg-green-100 border-green-300 text-green-700"
                  : "bg-gray-100 border-gray-300 text-gray-600"
              }`}
            >
              {socialMedia.instagram.enabled ? "Active" : "Disabled"}
            </button>
          </div>

          <div className="space-y-2.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-theme mb-1">
                Instagram Handle
              </label>
              <input
                type="text"
                value={socialMedia.instagram.handle}
                onChange={(e) =>
                  updateSocialField("instagram", "handle", e.target.value)
                }
                placeholder="@restaurant.name"
                className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme mb-1">
                Profile Direct URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={socialMedia.instagram.url}
                  onChange={(e) =>
                    updateSocialField("instagram", "url", e.target.value)
                  }
                  placeholder="https://instagram.com/yourbrand"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => window.open(socialMedia.instagram.url, "_blank")}
                  className="p-2 rounded-lg border border-theme text-secondary hover:text-primary hover:bg-surface-soft shrink-0"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme mb-1">
                Followers Badge Label
              </label>
              <input
                type="text"
                value={socialMedia.instagram.followersDisplay}
                onChange={(e) =>
                  updateSocialField("instagram", "followersDisplay", e.target.value)
                }
                placeholder="e.g. 14.2K Foodies"
                className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Google Reviews */}
        <div className="bg-surface rounded-xl border border-theme p-4 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Star size={18} className="fill-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-theme">Google Reviews & Maps</h4>
                <p className="text-[11px] text-secondary">
                  Prompt happy guests to rate your restaurant
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleSocialChannel("googleReview")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                socialMedia.googleReview.enabled
                  ? "bg-green-100 border-green-300 text-green-700"
                  : "bg-gray-100 border-gray-300 text-gray-600"
              }`}
            >
              {socialMedia.googleReview.enabled ? "Active" : "Disabled"}
            </button>
          </div>

          <div className="space-y-2.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-theme mb-1">
                Google Business Listing Name
              </label>
              <input
                type="text"
                value={socialMedia.googleReview.placeName}
                onChange={(e) =>
                  updateSocialField("googleReview", "placeName", e.target.value)
                }
                placeholder="The Spice Garden Restaurant"
                className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme mb-1">
                Direct Google Review Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={socialMedia.googleReview.reviewUrl}
                  onChange={(e) =>
                    updateSocialField("googleReview", "reviewUrl", e.target.value)
                  }
                  placeholder="https://g.page/r/your-restaurant/review"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => window.open(socialMedia.googleReview.reviewUrl, "_blank")}
                  className="p-2 rounded-lg border border-theme text-secondary hover:text-primary hover:bg-surface-soft shrink-0"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-theme mb-1">
                  Average Rating
                </label>
                <input
                  type="text"
                  value={socialMedia.googleReview.starRating}
                  onChange={(e) =>
                    updateSocialField("googleReview", "starRating", e.target.value)
                  }
                  placeholder="4.9"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-theme mb-1">
                  Total Reviews Count
                </label>
                <input
                  type="number"
                  value={socialMedia.googleReview.reviewCount}
                  onChange={(e) =>
                    updateSocialField(
                      "googleReview",
                      "reviewCount",
                      Number(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Helpline */}
        <div className="bg-surface rounded-xl border border-theme p-4 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-theme">WhatsApp Concierge</h4>
                <p className="text-[11px] text-secondary">
                  Instant table concierge & manager chat
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleSocialChannel("whatsapp")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                socialMedia.whatsapp.enabled
                  ? "bg-green-100 border-green-300 text-green-700"
                  : "bg-gray-100 border-gray-300 text-gray-600"
              }`}
            >
              {socialMedia.whatsapp.enabled ? "Active" : "Disabled"}
            </button>
          </div>

          <div className="space-y-2.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-theme mb-1">
                WhatsApp Helpline Number
              </label>
              <input
                type="text"
                value={socialMedia.whatsapp.displayNumber}
                onChange={(e) =>
                  updateSocialField("whatsapp", "displayNumber", e.target.value)
                }
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme mb-1">
                Helpline Title Label
              </label>
              <input
                type="text"
                value={socialMedia.whatsapp.supportLabel}
                onChange={(e) =>
                  updateSocialField("whatsapp", "supportLabel", e.target.value)
                }
                placeholder="Manager & Concierge Helpline"
                className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Facebook & Other Channels */}
        <div className="bg-surface rounded-xl border border-theme p-4 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FacebookIcon size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-theme">Facebook Page</h4>
                <p className="text-[11px] text-secondary">
                  Official community page
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleSocialChannel("facebook")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                socialMedia.facebook.enabled
                  ? "bg-green-100 border-green-300 text-green-700"
                  : "bg-gray-100 border-gray-300 text-gray-600"
              }`}
            >
              {socialMedia.facebook.enabled ? "Active" : "Disabled"}
            </button>
          </div>

          <div className="space-y-2.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-theme mb-1">
                Page URL
              </label>
              <input
                type="text"
                value={socialMedia.facebook.url}
                onChange={(e) =>
                  updateSocialField("facebook", "url", e.target.value)
                }
                placeholder="https://facebook.com/yourpage"
                className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={socialMedia.facebook.pageName}
                onChange={(e) =>
                  updateSocialField("facebook", "pageName", e.target.value)
                }
                placeholder="The Spice Garden"
                className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Guest Wi-Fi Sharing Card */}
      <div className="bg-surface rounded-xl border border-theme p-4 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <Wifi size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-theme">
                Guest Wi-Fi Sharing Card
              </h4>
              <p className="text-xs text-secondary mt-0.5">
                Automatically displays Wi-Fi network credentials to seated customers inside the order portal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              updateWifiSettings({ enabled: !socialMedia.wifiSharing.enabled })
            }
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              socialMedia.wifiSharing.enabled
                ? "bg-green-100 border-green-300 text-green-700"
                : "bg-gray-100 border-gray-300 text-gray-600"
            }`}
          >
            {socialMedia.wifiSharing.enabled ? "Wi-Fi Card Visible" : "Card Hidden"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-theme mb-1">
              Wi-Fi Network Name (SSID)
            </label>
            <input
              type="text"
              value={socialMedia.wifiSharing.ssid}
              onChange={(e) => updateWifiSettings({ ssid: e.target.value })}
              placeholder="Restaurant_Guest_WiFi"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme mb-1">
              Wi-Fi Password
            </label>
            <input
              type="text"
              value={socialMedia.wifiSharing.password}
              onChange={(e) => updateWifiSettings({ password: e.target.value })}
              placeholder="guestpass2026"
              className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme mb-1">
              Security Protocol
            </label>
            <select
              value={socialMedia.wifiSharing.security}
              onChange={(e) => updateWifiSettings({ security: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme focus:outline-none focus:border-primary"
            >
              <option value="WPA2">WPA2 Personal</option>
              <option value="WPA3">WPA3</option>
              <option value="WEP">WEP</option>
              <option value="Open">Open (No Password)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Follow & Win Social Incentive Campaign */}
      <div className="bg-surface rounded-xl border border-theme p-4 space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-theme">
                "Follow & Win" Table Campaign Banner
              </h4>
              <p className="text-xs text-secondary mt-0.5">
                Incentivize diners to follow your social handle by offering a complimentary dessert, shot, or discount.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              updateFollowIncentive({
                enabled: !socialMedia.followIncentive.enabled,
              })
            }
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              socialMedia.followIncentive.enabled
                ? "bg-green-100 border-green-300 text-green-700"
                : "bg-gray-100 border-gray-300 text-gray-600"
            }`}
          >
            {socialMedia.followIncentive.enabled ? "Campaign Active" : "Campaign Paused"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-theme mb-1">
              Campaign Title Headline
            </label>
            <input
              type="text"
              value={socialMedia.followIncentive.title}
              onChange={(e) =>
                updateFollowIncentive({ title: e.target.value })
              }
              placeholder="e.g. Follow Us & Get 10% Off Dessert"
              className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme mb-1">
              Campaign Instructions
            </label>
            <input
              type="text"
              value={socialMedia.followIncentive.description}
              onChange={(e) =>
                updateFollowIncentive({ description: e.target.value })
              }
              placeholder="e.g. Show your follow screen to the service captain"
              className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
