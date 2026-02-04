import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();

  // 1. Not logged in? Go to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 2. Role Mismatch Handling
  if (requiredRole && user.role !== requiredRole) {
    // If an Admin tries to access a Commander route, send them to Admin HQ
    if (user.role === "SUPER_ADMIN") {
      return <Navigate to="/admin-hq" />;
    }
    
    // If a Commander tries to access an Admin route, send them to Commander Dashboard
    if (user.role === "COMMANDER") {
      return <Navigate to="/" />;
    }
  }

  // 3. Authorized? Render the page
  return children;
};

export default ProtectedRoute;