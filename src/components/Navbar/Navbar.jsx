import { Menu, Bell } from "lucide-react";

const Navbar = ({ setIsOpen }) => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Toggle Button: Mobile Only */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 md:hidden transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-xl font-bold text-gray-900 leading-none">
            Dashboard
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Tuesday, May 6, 2026 • St. Mary Medical Center
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2.5 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-100 ml-2">
          AR
        </div>
      </div>
    </header>
  );
};

export default Navbar;
