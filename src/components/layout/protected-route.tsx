import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, useAuthStore } from '@/store/auth-store';

export function ProtectedRoute() {
  const authed = useAuthStore(selectIsAuthenticated);
  const location = useLocation();
  if (!authed) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function GuestOnlyRoute() {
  const authed = useAuthStore(selectIsAuthenticated);
  if (authed) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
