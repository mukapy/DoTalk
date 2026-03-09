import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const [isVerifying, setIsVerifying] = useState(!user && isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchProfile().finally(() => setIsVerifying(false));
    }
  }, [isAuthenticated, user, fetchProfile]);

  // While we're verifying the token by fetching the profile, show nothing
  if (isVerifying) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
