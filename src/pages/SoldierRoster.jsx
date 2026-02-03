import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Users,
  ShieldCheck,
  MoreHorizontal,
  HeartPulse,
  Shield,
  Search,
} from "lucide-react";

const SoldierRoster = () => {
  const [soldiers, setSoldiers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // In a professional setup, the backend should filter this
    // based on the logged-in Commander's ID
    api.get("/soldiers").then((res) => setSoldiers(res.data));
  }, []);

  // Filter logic for searching by name or ID
  const filteredSoldiers = soldiers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.soldierId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
              Unit Roster
            </h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-1">
              Active Personnel in Command: {soldiers.length}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Tactical Search Bar */}
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-white outline-none focus:border-emerald-500/50 transition-all w-full md:w-64"
              />
            </div>
            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10 font-mono text-[10px] h-fit">
              <ShieldCheck size={14} /> ENCRYPTION_ACTIVE
            </div>
          </div>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <th className="p-6">Hardware ID</th>
                  <th className="p-6">Personnel</th>
                  <th className="p-6">Rank</th>
                  <th className="p-6">Designation</th>
                  <th className="p-6">Unit</th>
                  <th className="p-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredSoldiers.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-slate-800/20 transition-all group"
                  >
                    <td className="p-6 font-mono text-emerald-500 font-bold tracking-tighter text-sm">
                      {s.soldierId}
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-white uppercase text-sm group-hover:text-emerald-400 transition-colors">
                          {s.name}
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono">
                          Blood: {s.bloodGroup || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-slate-300 font-bold text-xs uppercase tracking-tighter">
                      {s.rank}
                    </td>
                    <td className="p-6">
                      <span
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black w-fit border ${
                          s.role === "MEDIC"
                            ? "bg-red-500/10 border-red-500/20 text-red-500"
                            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        }`}
                      >
                        {s.role === "MEDIC" ? (
                          <HeartPulse size={12} />
                        ) : (
                          <Shield size={12} />
                        )}
                        {s.role || "SOLDIER"}
                      </span>
                    </td>
                    <td className="p-6 text-slate-400 font-medium text-xs">
                      {s.unit}
                    </td>
                    <td className="p-6 text-center text-slate-600">
                      <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors hover:text-white">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSoldiers.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-slate-600 font-mono text-xs uppercase tracking-[0.3em]">
                No Personnel Found in Database
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoldierRoster;
