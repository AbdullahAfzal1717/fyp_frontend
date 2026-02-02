import { useEffect, useState } from "react";
import api from "../services/api";
import { Users, ShieldCheck, MoreHorizontal } from "lucide-react";

const SoldierRoster = () => {
  const [soldiers, setSoldiers] = useState([]);

  useEffect(() => {
    api.get("/soldiers").then((res) => setSoldiers(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
              Unit Roster
            </h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-1">
              Total Active Personnel: {soldiers.length}
            </p>
          </div>
          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-lg border border-emerald-500/10 font-mono text-[10px]">
            <ShieldCheck size={14} /> DATABASE_SYNC_OK
          </div>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                <th className="p-8">ID</th>
                <th className="p-8">Personnel Name</th>
                <th className="p-8">Rank / Designation</th>
                <th className="p-8">Unit Sector</th>
                <th className="p-8 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {soldiers.map((s) => (
                <tr
                  key={s._id}
                  className="hover:bg-slate-800/30 transition-all"
                >
                  <td className="p-8 font-mono text-emerald-500 font-bold tracking-tighter">
                    {s.soldierId}
                  </td>
                  <td className="p-8 font-bold text-white uppercase text-sm">
                    {s.name}
                  </td>
                  <td className="p-8 text-slate-400 font-medium">{s.rank}</td>
                  <td className="p-8 text-slate-400 font-medium">{s.unit}</td>
                  <td className="p-8 text-center text-slate-600 cursor-pointer hover:text-white transition-colors">
                    <MoreHorizontal className="mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SoldierRoster;
