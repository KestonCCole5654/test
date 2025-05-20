import { User } from '@supabase/supabase-js';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  user: User | null;
  isLoading?: boolean;
}

const ProtectedRoute = ({ user, isLoading = false }: ProtectedRouteProps) => {
  // Debugging group
  if (process.env.NODE_ENV === 'development') {
    console.groupCollapsed('[ProtectedRoute] Debug');
    console.log('User:', user);
    console.log('Loading state:', isLoading);
    console.log('Path:', window.location.pathname);
    console.groupEnd();
  }

  // Handle loading state
  if (isLoading) {
    return <div className="p-4 text-center">Verifying session...</div>;
  }

  // Session validation
  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[ProtectedRoute] No user - redirecting to login');
    }
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;