// src/components/RoleGuard.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleGuard({ children, allowedRoles }) {
  const { currentUser, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is allowed
  if (!allowedRoles.includes(currentUser.role)) {
    // Redirect based on user's actual role
    switch (currentUser.role) {
      case 'Admin':
        return <Navigate to="/stores" replace />;
      case 'Manager':
        return <Navigate to="/users" replace />;
      case 'Cashier':
        return <Navigate to="/pos" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
}