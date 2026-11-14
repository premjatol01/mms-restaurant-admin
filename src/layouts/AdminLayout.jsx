import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Lock, ArrowRight, AlertTriangle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import RoleAccessDenied from "../components/RoleAccessDenied";
import { useAuth } from "../hooks/useAuth";
import { apiClient } from "../api/client";
import { useProfileStore } from "../store/profileStore";
import { useSubscriptionStore } from "../store/subscriptionStore";

export default function AdminLayout() {
  const { isAuthenticated, isLoggingOut, user } = useAuth();
  const [maintenanceInfo, setMaintenanceInfo] = useState(null);
  const marketingWebUrl = import.meta.env.VITE_MARKETING_WEBSITE_URL || "http://localhost:3000";

  useEffect(() => {
    if (isAuthenticated) {
      // Pre-fetch live profile and subscription status
      useProfileStore.getState().fetchProfile().catch(() => {});
      useSubscriptionStore.getState().loadSubscription().catch(() => {});

      apiClient
        .get("/platform-settings")
        .then((res) => {
          const data = res?.data?.data || res?.data;
          if (data?.maintenanceEnabled || data?.platformStatus === "Maintenance") {
            setMaintenanceInfo(data);
          } else {
            setMaintenanceInfo(null);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // When logging out, show clean transition loader (prevents access denied screen flash)
  if (isLoggingOut) {
    return (
      <div className="min-h-screen bg-theme flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-theme">Logging out...</p>
        </div>
      </div>
    );
  }

  // Not logged in — show ONLY a clean centered message, no sidebar/header
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-theme flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-surface rounded-2xl border border-theme p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary mx-auto mb-5">
            <Lock size={22} />
          </div>
          <h2 className="text-xl font-bold text-theme mb-2">Access Required</h2>
          <p className="text-sm text-secondary mb-6 leading-relaxed">
            Please log in through the marketing website to access the Restaurant Admin panel.
          </p>
          <a
            href={`${marketingWebUrl}/login`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Go to Login Page
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    );
  }

  // Role check: if authenticated but role is not restaurant_admin
  if (user?.role && user.role !== "restaurant_admin") {
    return <RoleAccessDenied requiredRole="restaurant_admin" />;
  }

  // Logged in with valid role — full layout with sidebar + header
  return (
    <div className="flex h-screen overflow-hidden bg-theme">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        {maintenanceInfo && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Platform Maintenance Notice:</strong> Super Admin has activated platform maintenance mode. Customer ordering portals and public restaurant pages are displaying the maintenance notice.
              </span>
            </div>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
