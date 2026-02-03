import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      if (location.pathname !== "/login") navigate("/login");
      return;
    }

    try {
      // Professional: Verify the user with the backend on every refresh
      const response = await api.get("/auth/me");
      setUser(response.data);

      if (location.pathname === "/login") {
        navigate(response.data.role === "SUPER_ADMIN" ? "/admin-hq" : "/");
      }
    } catch (err) {
      console.error("Session invalid or expired");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = ({ token, userData }) => {
    localStorage.setItem("token", token);
    setUser(userData);
    navigate(userData.role === "SUPER_ADMIN" ? "/admin-hq" : "/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  if (loading)
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-emerald-500 font-mono">
        AUTHENTICATING SESSION...
      </div>
    );

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
