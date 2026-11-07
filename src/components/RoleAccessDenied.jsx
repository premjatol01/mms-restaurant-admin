import React from "react";
import { ShieldAlert, LogOut, ExternalLink, ArrowLeft, Lock } from "lucide-react";
import Button from "./ui/Button";
import { useAuth } from "../hooks/useAuth";

export default function RoleAccessDenied({ requiredRole = "restaurant_admin" }) {
  const { user, logout } = useAuth();
  const marketingWebUrl = import.meta.env.VITE_MARKETING_WEBSITE_URL || "http://localhost:3000";
  const superAdminUrl = import.meta.env.VITE_SUPER_ADMIN_URL || "http://localhost:3001";

  const currentRole = user?.role || "unknown";
  const isSuperAdmin = currentRole === "super_admin";

  const formatRoleName = (role) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "restaurant_admin":
        return "Restaurant Admin";
      case "customer":
        return "Customer";
      default:
        return role ? role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "User";
    }
  };

  return (
    <div className="min-h-screen bg-theme flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-surface rounded-2xl border border-theme shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-b from-amber-500/10 to-transparent border-b border-theme p-6 sm:p-8 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShieldAlert size={32} />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 mb-2">
            <Lock size={12} /> Access Restricted
          </span>
          <h2 className="text-2xl font-bold text-theme">Role Access Required</h2>
          <p className="text-sm text-secondary mt-1.5 max-w-sm mx-auto">
            Your account does not have permission to access the Restaurant Admin Workspace.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Role Comparison Card */}
          <div className="bg-primary-light/10 border border-theme rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-secondary uppercase tracking-wider pb-2 border-b border-theme">
              <span>Account Info</span>
              <span>Permission Status</span>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-secondary">Logged in as:</span>
              <span className="font-medium text-theme truncate max-w-[200px]" title={user?.email || user?.name}>
                {user?.name || user?.email || "Authenticated User"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-secondary">Your Current Role:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20">
                {formatRoleName(currentRole)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-secondary">Required Role:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/20">
                {formatRoleName(requiredRole)}
              </span>
            </div>
          </div>

          {/* Explanation message */}
          <div className="text-xs text-secondary bg-surface border border-theme/60 rounded-lg p-3.5 leading-relaxed">
            {isSuperAdmin ? (
              <p>
                You are currently signed in with a <strong>Super Admin</strong> account. Platform configurations and restaurant oversight are managed via the <strong>Super Admin Portal</strong>.
              </p>
            ) : (
              <p>
                This portal is reserved strictly for restaurant managers. Please log in with an authorized restaurant admin account to proceed.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {isSuperAdmin && (
              <a
                href={superAdminUrl}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
              >
                <span>Go to Super Admin Portal</span>
                <ExternalLink size={15} />
              </a>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href={`${marketingWebUrl}/login`}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  !isSuperAdmin
                    ? "bg-primary text-white hover:bg-[var(--color-primary-hover)] shadow-sm"
                    : "bg-surface border border-theme text-theme hover:bg-primary-light/20"
                }`}
              >
                <ArrowLeft size={15} />
                <span>Switch Account</span>
              </a>

              <Button
                variant={isSuperAdmin ? "ghost" : "secondary"}
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Support Info */}
        <div className="px-6 py-3 bg-primary-light/10 border-t border-theme text-center">
          <p className="text-xs text-secondary">
            Need help?{" "}
            <a href="mailto:support@tablly.com" className="text-primary hover:underline font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
