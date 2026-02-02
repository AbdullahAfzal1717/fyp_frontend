import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, UserPlus, LogOut, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { path: "/roster", icon: <Users size={20} />, label: "Unit Roster" },
    {
      path: "/register-soldier",
      icon: <UserPlus size={20} />,
      label: "Enlist Soldier",
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-2 text-emerald-500 border-b border-slate-800">
        <Shield size={28} />
        <span className="font-black tracking-tighter text-white uppercase italic">
          Command-X
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${
              location.pathname === item.path
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                : "text-slate-500 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={logout}
        className="m-4 p-3 flex items-center gap-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
      >
        <LogOut size={20} /> Terminate Session
      </button>
    </aside>
  );
};

export default Sidebar;
