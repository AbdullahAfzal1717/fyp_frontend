import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Activity,
  AlertTriangle,
  Shield,
  User,
  Battery,
  MapPin,
} from "lucide-react";
import { socket } from "../services/socket";

const Dashboard = () => {
  const [soldiers, setSoldiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await api.get("/vitals");
      setSoldiers(response.data);
      setError(null);
    } catch (err) {
      setError("Sync Error: Gateway Unreachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchData(); // Initial load

    // Listen for real-time updates
    socket.on("newVitals", (updatedSoldier) => {
      setSoldiers((prev) => {
        const index = prev.findIndex(
          (s) => s.soldierId === updatedSoldier.soldierId
        );
        if (index !== -1) {
          const newList = [...prev];
          newList[index] = updatedSoldier;
          return newList;
        }
        return [updatedSoldier, ...prev];
      });
    });

    return () => {
      socket.off("newVitals");
    };
  }, [user, navigate]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-emerald-500 font-mono">
        <Activity className="mr-2 animate-spin" /> INITIALIZING TACTICAL
        UPLINK...
      </div>
    );

  const criticalSoldiers = soldiers.filter((s) => s.riskLevel === "CRITICAL");

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 hidden md:block">
        <div className="flex items-center gap-2 mb-10 text-emerald-500">
          <Shield size={28} />
          <h1 className="font-bold text-xl tracking-tighter text-white uppercase">
            Command-X
          </h1>
        </div>
        <nav className="space-y-4 text-sm font-bold uppercase tracking-widest">
          <button className="flex items-center gap-3 w-full p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Activity size={18} /> Dashboard
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-500 hover:bg-slate-800 transition">
            <User size={18} /> Unit Roster
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">
              Live Surveillance
            </h2>
            <p className="text-slate-500 text-xs font-mono">
              NET_STATUS:{" "}
              <span className="text-emerald-500">ENCRYPTED LORA_NODE</span>
            </p>
          </div>
          <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400">
            SECTOR: FAISALABAD_BASE
          </div>
        </header>

        {criticalSoldiers.length > 0 && (
          <div className="mb-8 p-4 bg-red-500/10 border-l-4 border-red-600 rounded-r-xl animate-pulse">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <AlertTriangle size={18} />
              <h3 className="font-black uppercase tracking-tighter">
                Priority 1: Health Alert
              </h3>
            </div>
            {criticalSoldiers.map((c) => (
              <p key={c._id} className="text-red-200 text-xs font-mono">
                {c.soldierId} :: BIOMETRIC THRESHOLD EXCEEDED
              </p>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {soldiers.map((s) => (
            <div
              key={s._id}
              onClick={() => navigate(`/soldier/${s.soldierId}`)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 cursor-pointer transition-all group active:scale-[0.98]"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-black text-white group-hover:text-emerald-400 uppercase italic">
                  {s.soldierId}
                </h4>
                <span
                  className={`px-2 py-1 rounded text-[10px] font-black tracking-widest ${getRiskClasses(
                    s.riskLevel
                  )}`}
                >
                  {s.riskLevel}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-600 font-bold uppercase block mb-1 tracking-widest">
                    Pulse
                  </span>
                  <span className="text-xl font-mono text-white leading-none">
                    {s.heartRate}{" "}
                    <small className="text-[10px] text-slate-500 italic">
                      BPM
                    </small>
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-600 font-bold uppercase block mb-1 tracking-widest">
                    SPO2
                  </span>
                  <span className="text-xl font-mono text-white leading-none">
                    {s.spo2}%
                  </span>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center text-[10px] font-mono text-slate-600">
                <div className="flex items-center gap-1">
                  <Battery
                    size={14}
                    className={
                      s.batteryLevel < 20 ? "text-red-500" : "text-emerald-500"
                    }
                  />
                  {s.batteryLevel}%
                </div>
                <div className="flex items-center gap-1 uppercase tracking-tighter">
                  <MapPin size={12} /> Active Zone
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const getRiskClasses = (risk) => {
  if (risk === "CRITICAL")
    return "bg-red-500/20 text-red-500 border border-red-500/30";
  if (risk === "WARNING")
    return "bg-amber-500/20 text-amber-500 border border-amber-500/30";
  return "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30";
};

export default Dashboard;
