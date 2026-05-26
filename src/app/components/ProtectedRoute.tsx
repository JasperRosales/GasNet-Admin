import { Navigate } from "react-router";
import { useAuth } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType: "admin" | "staff";
}

export function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { session, profile, loading, error } = useAuth();

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

  const role = profile?.role;
  const isAllowed =
    !role
      ? true
      : requiredUserType === "admin"
        ? role === "Admin"
        : role === "Staff" || role === "Manager";

  if (!session || !isAllowed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
