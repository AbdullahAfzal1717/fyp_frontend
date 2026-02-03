import { useState, useEffect } from "react";
import api from "../services/api";
import { Globe, Loader2 } from "lucide-react";
import SectorCard from "../components/Admin/SectorCard";

const ManageSectors = () => {
  const [sectors, setSectors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const res = await api.get("/admin/commanders");
        // Professional Logic: Mapping commanders to their respective regions
        const grouped = res.data.reduce((acc, commander) => {
          const region = commander.region || "General Reserve";
          if (!acc[region]) acc[region] = [];
          acc[region].push(commander);
          return acc;
        }, {});
        setSectors(grouped);
      } catch (err) {
        console.error("Sector Uplink Failed");
      } finally {
        setLoading(false);
      }
    };
    fetchSectors();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-500 font-mono">
        <Loader2 className="animate-spin mb-4" size={32} />
        <span className="text-xs uppercase tracking-[0.4em]">
          Syncing Sector Data...
        </span>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-slate-800 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Sector Configuration
            </h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-2">
              Global Area of Operations Management
            </p>
          </div>
          <div className="hidden md:block text-[10px] font-mono text-slate-600 uppercase">
            Total Sectors: {Object.keys(sectors).length}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(sectors).map(([name, commanders]) => (
            <SectorCard key={name} sectorName={name} commanders={commanders} />
          ))}

          {/* New Sector Placeholder */}
          <button className="border-2 border-dashed border-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center text-slate-600 hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-500 transition-all group">
            <Globe
              size={40}
              className="mb-4 opacity-20 group-hover:opacity-100 transition-opacity"
            />
            <p className="font-black text-xs uppercase tracking-widest">
              Initialize New Sector
            </p>
            <p className="text-[9px] font-mono mt-2 opacity-50 uppercase tracking-tighter">
              Secure GHQ Authorization
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageSectors;
