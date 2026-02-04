import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  LogOut,
  Shield,
  Landmark,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();

  // Auto-close sidebar when route changes (for mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const commanderMenu = [
    { path: "/", icon: <LayoutDashboard size={20} />, label: "Live Dashboard" },
    { path: "/roster", icon: <Users size={20} />, label: "Unit Roster" },
    {
      path: "/register-soldier",
      icon: <UserPlus size={20} />,
      label: "Enlist Personnel",
    },
  ];

  const adminMenu = [
    { path: "/admin-hq", icon: <Landmark size={20} />, label: "GHQ Command" },
    {
      path: "/manage-sectors",
      icon: <Settings size={20} />,
      label: "Sector Config",
    },
  ];

  const activeMenu = user?.role === "SUPER_ADMIN" ? adminMenu : commanderMenu;

  return (
    <>
      {/* 1. Mobile Toggle Button - Only visible on small screens */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-slate-900 border border-slate-800 rounded-lg text-emerald-500"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 2. Mobile Overlay - Blurs background when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[40] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 3. Main Sidebar Container */}
      <aside
        className={`
        fixed lg:sticky top-0 left-0 z-[50]
        h-screen w-64 bg-slate-900 border-r border-slate-800 
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Header Section */}
        <div className="p-6 flex items-center gap-2 text-emerald-500 border-b border-slate-800">
          <Shield
            size={28}
            className={
              user?.role === "SUPER_ADMIN"
                ? "text-blue-500"
                : "text-emerald-500"
            }
          />
          <div className="flex flex-col">
            <span className="font-black tracking-tighter text-white uppercase italic leading-none">
              Command-X
            </span>
            <span className="text-[9px] font-mono text-slate-500 tracking-[0.2em] mt-1">
              {user?.role === "SUPER_ADMIN" ? "STRATEGIC_HQ" : "TACTICAL_UNIT"}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          {activeMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-[11px] uppercase tracking-widest ${
                location.pathname === item.path
                  ? user?.role === "SUPER_ADMIN"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                  : "text-slate-500 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom Section: Profile & Logout */}
        <div className="mt-auto">
          <div className="mx-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50 mb-2">
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">
              Authenticated
            </p>
            <p className="text-xs font-bold text-slate-300 truncate">
              {user?.name || "Officer"}
            </p>
            <p className="text-[10px] text-emerald-500/70 font-mono mt-1 uppercase italic">
              {user?.region || "Faisalabad"}
            </p>
          </div>

          <button
            onClick={logout}
            className="w-[calc(100%-2rem)] mx-4 mb-4 p-3 flex items-center gap-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-[11px] uppercase tracking-widest border border-transparent hover:border-red-500/20"
          >
            <LogOut size={20} /> Terminate Session
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
