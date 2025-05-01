// src/components/AuthenticatedRoute.tsx
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "../loadingSpinner";

interface Props {
  authenticated: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function AuthenticatedRoute({
  authenticated,
  isLoading = false,
  children,
}: Props) {
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-slate-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}