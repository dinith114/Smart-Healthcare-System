import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSkeleton from "./LoadingSkeleton";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#8aa082]/30 flex items-center justify-center">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboards = {
      admin: "/admin",
      staff: "/staff",
      patient: "/patient"
    };
    return <Navigate to={dashboards[user.role] || "/login"} replace />;
  }

  return children;
}

