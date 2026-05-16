export const ModernInput = ({ label, value, onChange, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-gray-700 ml-1">{label}</label>
    <input
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
    />
  </div>
);
