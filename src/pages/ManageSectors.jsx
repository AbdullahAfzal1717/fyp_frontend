import { useState, useEffect } from "react";
import api from "../services/api";
import { Settings, Map, Globe, Activity } from "lucide-react";

const ManageSectors = () => {
  const [sectors, setSectors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const res = await api.get("/admin/commanders");
        // Group commanders by region
        const grouped = res.data.reduce((acc, commander) => {
          const region = commander.region || "Unassigned";
          if (!acc[region]) acc[region] = [];
          acc[region].push(commander);
          return acc;
        }, {});
        setSectors(grouped);
      } catch (err) {
        console.error("Failed to load sectors");
      } finally {
        setLoading(false);
      }
    };
    fetchSectors();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-slate-800 pb-8">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Sector Configuration
          </h1>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-2">
            Global Area of Operations Management
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(sectors).map((sectorName) => (
            <div
              key={sectorName}
              className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 hover:border-blue-500/50 transition-all group"
            >
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
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-6">
                Sector HQ
              </p>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                  Assigned Commanders
                </p>
                {sectors[sectorName].map((commander) => (
                  <div
                    key={commander._id}
                    className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/50"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    <span className="text-xs font-bold text-slate-300 uppercase">
                      {commander.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add New Sector Placeholder */}
          <div className="border-2 border-dashed border-slate-800 rounded-[2rem] p-6 flex flex-col items-center justify-center text-slate-600 hover:border-blue-500/30 hover:text-blue-500 transition-all cursor-not-allowed">
            <Globe size={40} className="mb-4 opacity-20" />
            <p className="font-black text-xs uppercase tracking-widest">
              Initialize New Sector
            </p>
            <p className="text-[10px] font-mono mt-2 opacity-50">
              GHQ Approval Required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSectors;
