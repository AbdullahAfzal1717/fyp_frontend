import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  UserPlus,
  FileBarChart,
  UserCircle,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/useAuth";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout, user } = useAuth(); // Accessing logged-in user details
  const [counts, setCounts] = useState({ alerts: 0, pending: 0 });

  // 1. Fetch Dynamic Badge Counts
  const fetchCounts = async () => {
    try {
      // Get pending requests count
      const pendingRes = await api.get("/connections/pending");

      // Get alerts count (fetching for all connected users)
      const usersRes = await api.get("/connections/my-users");
      const connectedUsers = usersRes.data || [];

      const alertResponses = await Promise.allSettled(
        connectedUsers.map((u) => api.get(`/alerts/${u._id}`)),
      );

      let totalUnreadAlerts = 0;
      alertResponses.forEach((res) => {
        if (res.status === "fulfilled") {
          totalUnreadAlerts += res.value.data.filter((a) => !a.isRead).length;
        }
      });

      setCounts({
        pending: pendingRes.data?.length || 0,
        alerts: totalUnreadAlerts,
      });
    } catch (err) {
      console.error("Sidebar stats sync failed:", err);
    }
  };

  useEffect(() => {
    fetchCounts();
    // Refresh counts every 30 seconds to keep sidebar "live"
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Prevent background scrolling on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const navItems = [
    { path: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    {
      path: "/alerts",
      icon: <Bell size={20} />,
      label: "Alerts Log",
      badge: counts.alerts, // Dynamic Value
    },
    {
      path: "/pending-requests",
      icon: <UserPlus size={20} />,
      label: "Pending Requests",
      badge: counts.pending, // Dynamic Value
    },
    { path: "/reports", icon: <FileBarChart size={20} />, label: "Reports" },
    {
      path: "/profile",
      icon: <UserCircle size={20} />,
      label: "Profile & Settings",
    },
  ];

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  // Helper for Initials
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-100
          transition-all duration-300 ease-in-out flex flex-col
          z-110 ${isOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"}
          md:translate-x-0 md:sticky md:z-30 md:w-20 
          lg:w-64
      `}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 justify-between border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-white fill-current"
              >
                <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
              </svg>
            </div>
            <div className="flex flex-col md:hidden lg:flex">
              <span className="font-bold text-gray-900 leading-none tracking-tight">
                VitalSync
              </span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                Supervisor dashboard
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-4 md:hidden lg:block">
            Navigation
          </p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) setIsOpen(false);
              }}
              className={`
                flex items-center gap-4 px-3 py-3 rounded-xl transition-all
                ${isActive(item.path) ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-500 hover:bg-gray-50"}
                md:justify-center lg:justify-start
              `}
            >
              <span
                className={
                  isActive(item.path) ? "text-blue-600" : "text-gray-400"
                }
              >
                {item.icon}
              </span>
              <div className="flex items-center flex-1 md:hidden lg:flex">
                <span className="text-sm flex-1 truncate">{item.label}</span>
                {item.badge > 0 && (
                  <span
                    className={`${item.path === "/alerts" ? "bg-red-500" : "bg-blue-600"} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 min-w-4.5 text-center`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive(item.path) && (
                  <ChevronRight size={14} className="ml-1 opacity-40" />
                )}
              </div>
            </Link>
          ))}
        </nav>

        {/* Profile Footer - DYNAMIC */}
        <div className="p-4 border-t border-gray-50 bg-white">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-gray-50 md:justify-center lg:justify-start lg:p-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 border-2 border-white shadow-sm uppercase">
              {getInitials(user?.name)}
            </div>

            <div className="flex-1 min-w-0 md:hidden lg:block">
              <p className="text-[11px] font-bold text-gray-900 truncate">
                {user?.name || "Healthcare Admin"}
              </p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                {user?.role || "Supervisor"}
              </p>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-gray-400 hover:text-red-500 md:hidden lg:block"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
