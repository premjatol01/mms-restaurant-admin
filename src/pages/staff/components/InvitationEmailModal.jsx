import React, { useState } from "react";
import { Mail, Copy, Check, ExternalLink, ShieldCheck, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { useProfileStore } from "../../../store/profileStore";

export default function InvitationEmailModal({ isOpen, onClose, member }) {
  const [copied, setCopied] = useState(false);
  const profile = useProfileStore((s) => s.profile);

  if (!isOpen || !member) return null;

  const restaurantName = profile?.name || "Your Restaurant";
  const mainDomain = import.meta.env.VITE_MAIN_WEBSITE_DOMAIN || "localhost:3000";
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const activationUrl = `${protocol}//${mainDomain}/setup-password?token=${member.activationToken || "demo_token_123"}&email=${encodeURIComponent(member.email)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activationUrl);
    setCopied(true);
    toast.success("Activation link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateOpen = () => {
    window.open(activationUrl, "_blank");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Staff Email Invitation & Activation"
      size="lg"
    >
      <div className="space-y-5">
        {/* Email Header Info */}
        <div className="p-3.5 bg-surface-soft border border-theme rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-secondary font-medium">To:</span>
            <span className="font-semibold text-theme font-mono">{member.name} &lt;{member.email}&gt;</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-secondary font-medium">From:</span>
            <span className="font-semibold text-theme font-mono">Tablly Onboarding &lt;noreply@tablly.com&gt;</span>
          </div>
          <div className="flex items-center justify-between border-t border-theme/60 pt-2">
            <span className="text-secondary font-medium">Subject:</span>
            <span className="font-bold text-primary">Invitation to join {restaurantName} on Tablly</span>
          </div>
        </div>

        {/* Rendered Email Body Preview */}
        <div className="border border-theme rounded-2xl p-6 bg-surface shadow-xs space-y-5">
          {/* Email Brand Bar */}
          <div className="flex items-center gap-3 pb-4 border-b border-theme">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
              T
            </div>
            <div>
              <h4 className="text-sm font-bold text-theme">Tablly Restaurant Operating System</h4>
              <p className="text-[11px] text-secondary">Smart QR Dine-in & Kitchen Management</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-theme leading-relaxed">
            <p>Hello <strong>{member.name}</strong>,</p>
            <p className="text-secondary">
              You have been invited to join the staff team of <strong>{restaurantName}</strong> as a{" "}
              <span className="font-semibold text-primary">{member.roleName}</span> on Tablly.
            </p>
            <p className="text-secondary text-xs">
              With this role, you have been granted access to restaurant operations, kitchen orders, and floor management based on your assigned role permissions.
            </p>

            {/* CTA Button Box */}
            <div className="py-4 text-center">
              <button
                type="button"
                onClick={handleSimulateOpen}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 shadow-sm transition-all cursor-pointer"
              >
                <span>Accept Invitation & Set Password</span>
                <ExternalLink size={15} />
              </button>
              <p className="text-[11px] text-secondary mt-2">
                This activation link is valid for 7 days.
              </p>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-secondary space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
                <Clock size={13} />
                <span>One-Time Secure Activation</span>
              </div>
              <p className="text-[11px]">
                Upon opening the link, you will choose a secure password to activate your personal staff login.
              </p>
            </div>
          </div>
        </div>

        {/* Direct Link Share Option */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-theme block">
            Direct Activation Link (Share via WhatsApp or SMS):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={activationUrl}
              className="flex-1 bg-surface-soft border border-theme rounded-lg px-3 py-2 text-xs font-mono text-secondary select-all"
            />
            <Button variant="secondary" onClick={handleCopyLink} size="sm">
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? "Copied" : "Copy Link"}</span>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-theme flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </Modal>
  );
}
