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
} from "lucide-react"; // npm install lucide-react

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
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-emerald-500">
        <Activity className="mr-2 animate-spin" /> Initializing Tactical
        Uplink...
      </div>
    );

  const criticalSoldiers = soldiers.filter((s) => s.riskLevel === "CRITICAL");

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* 1. Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 hidden md:block">
        <div className="flex items-center gap-2 mb-10 text-emerald-500">
          <Shield size={28} />
          <h1 className="font-bold text-xl tracking-tighter text-white">
            COMMAND-X
          </h1>
        </div>
        <nav className="space-y-4">
          <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Activity size={20} /> Dashboard
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-400 hover:bg-slate-800 transition">
            <User size={20} /> Team Overview
          </button>
        </nav>
      </aside>

      {/* 2. Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Live Surveillance</h2>
            <p className="text-slate-500 text-sm">
              System Status:{" "}
              <span className="text-emerald-500">Online via LoRa</span>
            </p>
          </div>
          <div className="bg-slate-900 p-2 px-4 rounded-full border border-slate-800 text-xs font-mono text-slate-400">
            LOC: 33.6844, 73.0479 (ISL)
          </div>
        </header>

        {/* 3. Critical Alerts Banner */}
        {criticalSoldiers.length > 0 && (
          <div className="mb-8 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r-lg animate-pulse">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <AlertTriangle size={20} />
              <h3 className="font-bold uppercase tracking-widest text-sm">
                Immediate Danger Detected
              </h3>
            </div>
            {criticalSoldiers.map((c) => (
              <p key={c._id} className="text-red-200 text-sm">
                Urgent: Soldier{" "}
                <span className="font-bold underline">{c.soldierId}</span>{" "}
                vitals exceeding safety thresholds.
              </p>
            ))}
          </div>
        )}

        {/* 4. Soldier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {soldiers.map((s) => (
            <div
              key={s._id}
              onClick={() => navigate(`/soldier/${s.soldierId}`)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/50 cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-bold text-white group-hover:text-emerald-400">
                  {s.soldierId}
                </h4>
                <div
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter ${getRiskClasses(
                    s.riskLevel
                  )}`}
                >
                  {s.riskLevel}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs flex items-center gap-1 uppercase tracking-widest">
                    <Activity size={12} /> Heart Rate
                  </span>
                  <span className="text-xl font-mono text-white">
                    {s.heartRate}{" "}
                    <span className="text-xs text-slate-500">BPM</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">
                      Temp
                    </span>
                    <span className="text-sm font-bold text-slate-200">
                      {s.temperature}°C
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">
                      SpO₂
                    </span>
                    <span className="text-sm font-bold text-slate-200">
                      {s.spo2}%
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Battery
                      size={14}
                      className={
                        s.batteryLevel < 20
                          ? "text-red-500"
                          : "text-emerald-500"
                      }
                    />
                    {s.batteryLevel}%
                  </div>
                  <div className="flex items-center gap-1 italic">
                    <MapPin size={14} /> Active
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

// Helper for Tailwind classes based on risk
const getRiskClasses = (risk) => {
  if (risk === "CRITICAL")
    return "bg-red-500/20 text-red-500 border border-red-500/30";
  if (risk === "WARNING")
    return "bg-amber-500/20 text-amber-500 border border-amber-500/30";
  return "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30";
};

export default Dashboard;
