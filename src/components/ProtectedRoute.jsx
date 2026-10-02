import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, login } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Check if token is in the URL (coming from the marketing site login)
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");

    if (urlToken) {
      // Set the token using context action
      login(urlToken, null);
      // Remove token from URL for security
      navigate(location.pathname, { replace: true });
    }
    setIsChecking(false);
  }, [location, navigate, login]);

  // Still checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Not authenticated - Show block screen
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-8">
            You must be logged in as a Restaurant Admin to access this dashboard.
          </p>
          <a 
            href="http://localhost:3000/login"
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            Go to Login Page
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    );
  }

  // Authenticated - render the admin layout
  return <Outlet />;
}
