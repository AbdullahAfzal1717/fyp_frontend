import { Link, useLocation } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import { useAuth } from "../../context/useAuth";

const titles = {
  "/": "Dashboard",
  "/alerts": "Alerts",
  "/pending-requests": "Pending requests",
  "/reports": "Reports",
  "/profile": "Profile",
};

const Navbar = ({ setIsOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const pathKey = Object.keys(titles).find((p) =>
    p === "/" ? location.pathname === "/" : location.pathname.startsWith(p),
  );
  const title = pathKey ? titles[pathKey] : "VitalSync";

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const initials = (user?.name || "SV")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 sm:h-20 bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 md:hidden transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-none truncate">
            {title}
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1 truncate">
            {today}
            {user?.name ? ` · ${user.name}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link
          to="/alerts"
          className="relative p-2.5 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
          aria-label="Alerts"
        >
          <Bell size={18} />
        </Link>

        <Link
          to="/profile"
          className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-100"
          title={user?.name || "Profile"}
        >
          {initials}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
