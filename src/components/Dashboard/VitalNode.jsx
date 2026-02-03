import { Battery, MapPin } from "lucide-react";
import StatusBadge from "./StatusBadge";

const VitalNode = ({ soldier, onClick }) => (
  <div
    onClick={onClick}
    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 cursor-pointer transition-all group active:scale-[0.98]"
  >
    <div className="flex justify-between items-center mb-6">
      <h4 className="text-lg font-black text-white group-hover:text-emerald-400 uppercase italic">
        {soldier.soldierId}
      </h4>
      <StatusBadge level={soldier.riskLevel} />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
        <span className="text-[9px] text-slate-600 font-bold uppercase block mb-1 tracking-widest">
          Pulse
        </span>
        <span className="text-xl font-mono text-white leading-none">
          {soldier.heartRate}{" "}
          <small className="text-[10px] text-slate-500 italic">BPM</small>
        </span>
      </div>
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
        <span className="text-[9px] text-slate-600 font-bold uppercase block mb-1 tracking-widest">
          SPO2
        </span>
        <span className="text-xl font-mono text-white leading-none">
          {soldier.spo2}%
        </span>
      </div>
    </div>

    <div className="mt-6 flex justify-between items-center text-[10px] font-mono text-slate-600">
      <div className="flex items-center gap-1">
        <Battery
          size={14}
          className={
            soldier.batteryLevel < 20 ? "text-red-500" : "text-emerald-500"
          }
        />
        {soldier.batteryLevel}%
      </div>
      <div className="flex items-center gap-1 uppercase tracking-tighter">
        <MapPin size={12} /> Active Zone
      </div>
    </div>
  </div>
);

export default VitalNode;
