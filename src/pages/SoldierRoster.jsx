import { useEffect, useState } from "react";
import api from "../services/api";
import { ShieldCheck, Search, Users, Loader2 } from "lucide-react";
import RosterRow from "../components/Roster/RosterRow";

const SoldierRoster = () => {
  const [soldiers, setSoldiers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSoldiers = async () => {
      try {
        const res = await api.get("/soldiers");
        setSoldiers(res.data);
      } catch (err) {
        console.error("Database connection failed");
      } finally {
        setLoading(false);
      }
    };
    fetchSoldiers();
  }, []);

  const filteredSoldiers = soldiers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.soldierId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-500 font-mono">
        <Loader2 className="animate-spin mb-4" />
        <span className="text-[10px] uppercase tracking-[0.4em]">
          Querying Unit Database...
        </span>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
              Unit Roster
            </h1>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-1">
              Active Duty Personnel:{" "}
              <span className="text-emerald-500">{soldiers.length}</span>
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Tactical Search */}
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="SEARCH PERSONNEL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-[10px] font-mono text-white outline-none focus:border-emerald-500/50 transition-all w-full md:w-64 uppercase tracking-widest"
              />
            </div>
            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10 font-mono text-[9px] uppercase">
              <ShieldCheck size={14} /> Link Secured
            </div>
          </div>
        </header>

        {/* Table Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm bg-opacity-80">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <th className="p-6">ID_Code</th>
                  <th className="p-6">Personnel_Info</th>
                  <th className="p-6">Rank</th>
                  <th className="p-6">Designation</th>
                  <th className="p-6">Tactical_Unit</th>
                  <th className="p-6 text-center">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filteredSoldiers.map((s) => (
                  <RosterRow key={s._id} soldier={s} />
                ))}
              </tbody>
            </table>
          </div>

          {filteredSoldiers.length === 0 && (
            <div className="p-24 text-center">
              <Users className="mx-auto mb-4 text-slate-800" size={48} />
              <p className="text-slate-600 font-mono text-[10px] uppercase tracking-[0.4em]">
                No Records found in this sector
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoldierRoster;
