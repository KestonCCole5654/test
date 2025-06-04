// src/components/AuthenticatedRoute.tsx
import { useUser } from '@supabase/auth-helpers-react';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from '../ui/loadingSpinner';

export default function AuthenticatedRoute({ children, isLoading }: { children: React.ReactNode, isLoading?: boolean }) {
  const user = useUser();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

    return <>{children}</>;
}