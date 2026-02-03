const StatusBadge = ({ level }) => {
  const styles = {
    CRITICAL: "bg-red-500/20 text-red-500 border-red-500/30",
    WARNING: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    NORMAL: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-[10px] font-black tracking-widest border ${
        styles[level] || styles.NORMAL
      }`}
    >
      {level}
    </span>
  );
};

export default StatusBadge;
