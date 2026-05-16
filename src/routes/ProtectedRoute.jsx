import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "SUPERVISOR") {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;