// src/components/UnauthenticatedRoute.tsx
import { User } from '@supabase/supabase-js';
import { Navigate, Outlet } from 'react-router-dom';

interface UnauthenticatedRouteProps {
  user: User | null;
  isLoading?: boolean;
  redirectPath?: string;
}

const UnauthenticatedRoute = ({ 
  user,
  isLoading = false,
  redirectPath = '/invoices'
}: UnauthenticatedRouteProps) => {
  if (isLoading) {
    return <div>Loading authentication state...</div>;
  }

  return user ? <Navigate to={redirectPath} replace /> : <Outlet />;
};

export default UnauthenticatedRoute;