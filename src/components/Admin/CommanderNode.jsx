import { MapPin, ShieldCheck } from "lucide-react";

const CommanderNode = ({ commander }) => (
  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group hover:border-blue-500/30 transition-all">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
        <ShieldCheck size={20} />
      </div>
      <div>
        <h4 className="font-bold text-white uppercase text-sm group-hover:text-blue-400 transition-colors">
          {commander.name}
        </h4>
        <p className="text-[10px] text-slate-500 font-mono italic">
          ID: {commander.email}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 text-emerald-500 font-mono text-[10px] bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10 uppercase tracking-tighter">
      <MapPin size={12} /> {commander.region || "Global Reserve"}
    </div>
  </div>
);

export default CommanderNode;
