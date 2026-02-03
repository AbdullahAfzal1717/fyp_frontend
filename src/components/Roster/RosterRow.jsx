import { HeartPulse, Shield, MoreHorizontal } from "lucide-react";

const RosterRow = ({ soldier }) => {
  const isMedic = soldier.role === "MEDIC";

  return (
    <tr className="hover:bg-slate-800/20 transition-all group border-b border-slate-800/50 last:border-0">
      <td className="p-6 font-mono text-emerald-500 font-bold tracking-tighter text-sm">
        {soldier.soldierId}
      </td>
      <td className="p-6">
        <div className="flex flex-col">
          <span className="font-bold text-white uppercase text-sm group-hover:text-emerald-400 transition-colors">
            {soldier.name}
          </span>
          <span className="text-[10px] text-slate-600 font-mono tracking-tighter">
            BLOOD_TYPE: {soldier.bloodGroup || "O+"}
          </span>
        </div>
      </td>
      <td className="p-6 text-slate-300 font-bold text-xs uppercase tracking-tighter">
        {soldier.rank}
      </td>
      <td className="p-6">
        <span
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black w-fit border ${
            isMedic
              ? "bg-red-500/10 border-red-500/20 text-red-500"
              : "bg-blue-500/10 border-blue-500/20 text-blue-400"
          }`}
        >
          {isMedic ? <HeartPulse size={12} /> : <Shield size={12} />}
          {soldier.role || "SOLDIER"}
        </span>
      </td>
      <td className="p-6 text-slate-400 font-medium text-xs uppercase tracking-tighter">
        {soldier.unit || "N/A"}
      </td>
      <td className="p-6 text-center text-slate-600">
        <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors hover:text-white">
          <MoreHorizontal size={18} />
        </button>
      </td>
    </tr>
  );
};

export default RosterRow;
