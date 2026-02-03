import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { socket } from "../../../services/socket";
import {
  Activity,
  Thermometer,
  Droplets,
  ArrowLeft,
  Clock,
  ShieldAlert,
  User,
  Shield,
  Briefcase,
} from "lucide-react";
import TacticalChart from "../../../components/Detail/TacticalChart";

const SoldierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        const [vitalsRes, soldiersRes] = await Promise.all([
          api.get(`/vitals/${id}`),
          api.get(`/soldiers`),
        ]);
        setHistory([...vitalsRes.data].reverse());
        setProfile(soldiersRes.data.find((s) => s.soldierId === id));
      } catch (err) {
        console.error("Link Failure");
      } finally {
        setLoading(false);
      }
    };

    fetchEverything();

    socket.on("newVitals", (newData) => {
      if (newData.soldierId === id) {
        setHistory((prev) => [...prev, newData].slice(-30));
      }
    });

    return () => socket.off("newVitals");
  }, [id]);

  if (loading)
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-500 font-mono">
        <Clock className="animate-spin mb-4" size={32} />
        <span className="tracking-[0.5em] text-[10px] uppercase">
          Establishing Tactical Link...
        </span>
      </div>
    );

  const current = history[history.length - 1];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-white transition mb-10 text-[10px] font-black uppercase tracking-widest"
      >
        <ArrowLeft size={14} /> Back to Command Hub
      </button>

      <div className="max-w-7xl mx-auto">
        {/* Header: Bio-Data Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 border-b border-slate-800 pb-10 gap-8">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-blue-500/10 border border-blue-500/20 rounded-[2rem] flex items-center justify-center text-blue-500 shadow-2xl shadow-blue-500/5">
              <User size={48} />
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">
                  {profile?.name || "Unknown"}
                </h1>
                <span className="bg-slate-800 text-blue-400 px-4 py-1.5 rounded-xl text-xs font-mono border border-slate-700">
                  {id}
                </span>
              </div>
              <div className="flex flex-wrap gap-6 mt-4 text-slate-500 font-mono text-[11px] uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <Shield size={14} /> {profile?.rank}
                </span>
                <span className="flex items-center gap-2">
                  <Briefcase size={14} /> {profile?.unit}
                </span>
                <span className="text-blue-500 font-bold tracking-normal">
                  BLOOD GROUP: {profile?.bloodGroup}
                </span>
              </div>
            </div>
          </div>

          {current && (
            <div
              className={`px-8 py-4 rounded-3xl border flex items-center gap-4 transition-all ${
                current.riskLevel === "CRITICAL"
                  ? "bg-red-500/10 border-red-500 text-red-500 animate-pulse"
                  : "bg-emerald-500/10 border-emerald-500 text-emerald-500"
              }`}
            >
              <ShieldAlert size={24} />
              <span className="font-black text-2xl uppercase italic">
                {current.riskLevel}
              </span>
            </div>
          )}
        </header>

        {/* Real-time Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatTile
            icon={<Activity />}
            label="Heart Rate"
            value={current?.heartRate}
            unit="BPM"
            color="text-red-500"
          />
          <StatTile
            icon={<Thermometer />}
            label="Body Temp"
            value={current?.temperature}
            unit="°C"
            color="text-orange-500"
          />
          <StatTile
            icon={<Droplets />}
            label="Blood O2"
            value={current?.spo2}
            unit="%"
            color="text-blue-500"
          />
        </div>

        {/* Tactical Trends (Charts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-2">
            <TacticalChart
              title="Real-time Heartbeat Trend"
              color="#ef4444"
              data={history}
              dataKey="heartRate"
            />
          </div>
          <TacticalChart
            title="Core Temperature Log"
            color="#f97316"
            data={history}
            dataKey="temperature"
            type="area"
          />
          <TacticalChart
            title="Oxygen Saturation Index"
            color="#3b82f6"
            data={history}
            dataKey="spo2"
            type="area"
          />
        </div>
      </div>
    </div>
  );
};

// Internal Page Components for better readability
const StatTile = ({ icon, label, value, unit, color }) => (
  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] group hover:border-slate-600 transition-all">
    <div
      className={`mb-4 ${color} opacity-40 group-hover:opacity-100 transition-opacity`}
    >
      {icon}
    </div>
    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.25em] mb-2">
      {label}
    </p>
    <div className="flex items-baseline gap-2">
      <span className="text-5xl font-mono font-black text-white tracking-tighter">
        {value || "00"}
      </span>
      <span className="text-slate-600 text-[10px] font-bold uppercase">
        {unit}
      </span>
    </div>
  </div>
);

export default SoldierDetail;
