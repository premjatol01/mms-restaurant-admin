import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import RoleAccessDenied from "./RoleAccessDenied";

export default function ProtectedRoute({ allowedRoles = ["restaurant_admin"] }) {
  const { isAuthenticated, user, isLoggingOut } = useAuth();

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

  // Not logged in — AdminLayout handles the "Access Required" state cleanly
  if (!isAuthenticated) {
    return <Outlet />;
  }

  // If authenticated, check if the user's role is allowed
  const userRole = user?.role;
  if (userRole && !allowedRoles.includes(userRole)) {
    return <RoleAccessDenied requiredRole={allowedRoles[0]} />;
  }

  return <Outlet />;
}
