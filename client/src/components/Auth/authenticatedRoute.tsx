// src/components/AuthenticatedRoute.tsx
import { User } from '@supabase/supabase-js';
import { Navigate, Outlet } from 'react-router-dom';

interface AuthenticatedRouteProps {
  user: User | null;
  isLoading?: boolean;
  redirectPath?: string;
}

const AuthenticatedRoute = ({ 
  user,
  isLoading = false,
  redirectPath = '/login'
}: AuthenticatedRouteProps) => {
  if (isLoading) {
    return <div>Loading authentication state...</div>;
  }

  return user ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default AuthenticatedRoute;