import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

/** Redirects to home if already authenticated (for login/register pages) */
export default function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
