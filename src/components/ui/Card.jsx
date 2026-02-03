export const Card = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl ${
      onClick
        ? "cursor-pointer hover:border-emerald-500/40 active:scale-[0.98] transition-all"
        : ""
    } ${className}`}
  >
    {children}
  </div>
);
