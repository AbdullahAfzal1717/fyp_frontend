import { MapPin, ShieldCheck } from "lucide-react";

const CommanderNode = ({ commander }) => (
  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-blue-500/30 transition-all overflow-hidden">
    {/* Left Side: Avatar and Info */}
    <div className="flex items-center gap-4 min-w-0">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
        <ShieldCheck size={20} />
      </div>

      {/* min-w-0 is the secret sauce here to allow text truncation */}
      <div className="min-w-0">
        <h4 className="font-bold text-white uppercase text-sm group-hover:text-blue-400 transition-colors truncate">
          {commander.name}
        </h4>
        <p className="text-[10px] text-slate-500 font-mono italic truncate">
          {commander.email}
        </p>
      </div>
    </div>

    {/* Right Side: Region Badge */}
    <div className="flex-shrink-0 self-start sm:self-center">
      <div className="flex items-center gap-2 text-emerald-500 font-mono text-[10px] bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10 uppercase tracking-tighter whitespace-nowrap">
        <MapPin size={12} className="flex-shrink-0" />
        <span className="truncate max-w-[120px] sm:max-w-[150px]">
          {commander.region || "Global Reserve"}
        </span>
      </div>
    </div>
  </div>
);

export default CommanderNode;
