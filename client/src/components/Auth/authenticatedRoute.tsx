// src/components/AuthenticatedRoute.tsx
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { LoadingSpinner } from "../ui/loadingSpinner";

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
  const location = useLocation();

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
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  // For route-based authentication, we should use Outlet
  // This ensures proper routing behavior
  if (children) {
    // If children are provided directly, render them
    return <>{children}</>;
  }
  
  // Otherwise use Outlet for nested routes
  return <Outlet />;
}