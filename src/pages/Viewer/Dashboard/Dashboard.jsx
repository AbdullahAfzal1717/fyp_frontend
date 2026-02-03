import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { socket } from "../../../services/socket";
import { Activity, AlertTriangle } from "lucide-react";
import VitalNode from "../../../components/Dashboard/VitalNode";

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
    if (!user) return; // ProtectedRoute handles redirection, but safety first
    fetchData();

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

    return () => socket.off("newVitals");
  }, [user]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-emerald-500 font-mono">
        <Activity className="mr-2 animate-spin" /> INITIALIZING TACTICAL
        UPLINK...
      </div>
    );

  const criticalSoldiers = soldiers.filter((s) => s.riskLevel === "CRITICAL");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <main className="p-6 md:p-10">
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
            SECTOR: {user?.region?.toUpperCase() || "UNASSIGNED"}
          </div>
        </header>

        {/* Priority Alerts Section */}
        {criticalSoldiers.length > 0 && (
          <div className="mb-8 p-4 bg-red-500/10 border-l-4 border-red-600 rounded-r-xl animate-pulse">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <AlertTriangle size={18} />
              <h3 className="font-black uppercase tracking-tighter">
                Priority 1: Health Alert
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {criticalSoldiers.map((c) => (
                <p
                  key={c._id}
                  className="text-red-200 text-[10px] font-mono bg-red-500/20 px-2 py-1 rounded"
                >
                  &gt; {c.soldierId} :: BIOMETRIC THRESHOLD EXCEEDED
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Main Grid */}
        {error ? (
          <div className="text-center p-20 bg-slate-900 rounded-[2rem] border border-red-500/20">
            <p className="text-red-500 font-mono text-xs uppercase tracking-widest">
              {error}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {soldiers.map((s) => (
              <VitalNode
                key={s._id}
                soldier={s}
                onClick={() => navigate(`/soldier/${s.soldierId}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
