import { Map } from "lucide-react";

const SectorCard = ({ sectorName, commanders }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 hover:border-blue-500/50 transition-all group">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20">
        <Map size={24} />
      </div>
      <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10 uppercase">
        Active
      </span>
    </div>

    <h3 className="text-xl font-black uppercase italic text-white mb-1">
      {sectorName}
    </h3>
    <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-6">
      Strategic Sector HQ
    </p>

    <div className="space-y-3">
      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">
        Assigned Commanders
      </p>
      {commanders.map((commander) => (
        <div
          key={commander._id}
          className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/50"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          <span className="text-[11px] font-bold text-slate-300 uppercase">
            {commander.name}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default SectorCard;
