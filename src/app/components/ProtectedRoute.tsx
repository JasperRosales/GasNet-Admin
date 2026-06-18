import { Navigate } from "react-router";
import { useAuth } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading, error } = useAuth();

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
