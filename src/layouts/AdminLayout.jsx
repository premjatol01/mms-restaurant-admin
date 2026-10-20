import { Outlet } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";

export default function AdminLayout() {
  const { isAuthenticated, isLoggingOut } = useAuth();
  const marketingWebUrl = import.meta.env.VITE_MARKETING_WEBSITE_URL || "http://localhost:3000";

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

  // Logged in — full layout with sidebar + header
  return (
    <div className="flex h-screen overflow-hidden bg-theme">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
