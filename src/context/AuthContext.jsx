import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";
import { createSocket } from "../services/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setSocket((prev) => {
      if (prev) prev.disconnect();
      return null;
    });
  }, []);

  const checkAuth = useCallback(async () => {
    const savedToken = localStorage.getItem("token");
    const publicPaths = ["/login", "/signup", "/forgot-password"];

    if (!savedToken) {
      setLoading(false);
      if (!publicPaths.includes(location.pathname)) navigate("/login");
      return;
    }

    try {
      const response = await api.get("/auth/me");
      if (response.data.role !== "SUPERVISOR") {
        clearSession();
        setLoading(false);
        navigate("/login");
        return;
      }
      setUser(response.data);
      setToken(savedToken);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession, location.pathname, navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!token || !user) return;
    const nextSocket = createSocket(token);
    nextSocket.connect();
    setSocket((prev) => {
      if (prev) prev.disconnect();
      return nextSocket;
    });
    return () => nextSocket.disconnect();
  }, [token, user]);

  const login = useCallback(
    ({ token: nextToken, userData }) => {
      if (userData?.role !== "SUPERVISOR") {
        throw new Error("Only supervisor accounts can access this dashboard");
      }
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
      setUser(userData);
      navigate("/");
    },
    [navigate],
  );

  // NEW: Signup Method
  const signup = useCallback(
    async (signupData) => {
      try {
        const res = await api.post("/auth/signup", {
          ...signupData,
          role: "SUPERVISOR",
        });
        // Redirect to login after successful signup
        navigate("/login", {
          state: { message: "Account created! Please sign in." },
        });
        return res.data;
      } catch (err) {
        throw new Error(getErrorMessage(err, "Registration failed"));
      }
    },
    [navigate],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearSession();
      navigate("/login");
    }
  }, [clearSession, navigate]);

  const value = useMemo(
    () => ({ user, login, signup, logout, socket, token }),
    [user, login, signup, logout, socket, token],
  );

  if (loading)
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-blue-600 font-bold tracking-widest text-xs uppercase">
          Command-X Securing Session...
        </p>
      </div>
    );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthContext;
