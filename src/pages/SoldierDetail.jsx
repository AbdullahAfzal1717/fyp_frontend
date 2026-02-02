import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { socket } from "../services/socket";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
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

const SoldierDetail = () => {
  const { id } = useParams(); // This is the soldierId (e.g., FC-247)
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null); // Added for bio-data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        setLoading(true);
        // 1. Fetch Vitals History
        const vitalsRes = await api.get(`/vitals/${id}`);
        setHistory([...vitalsRes.data].reverse());

        // 2. Fetch Soldier Profile (Professional Gap-fill)
        // Note: You'll need an endpoint like GET /soldiers/:id on your backend
        const profileRes = await api.get(`/soldiers`);
        const soldierData = profileRes.data.find((s) => s.soldierId === id);
        setProfile(soldierData);

        setError(null);
      } catch (err) {
        setError("TACTICAL_DATABASE_OFFLINE");
      } finally {
        setLoading(false);
      }
    };
    fetchEverything();

    socket.on("newVitals", (newData) => {
      if (newData.soldierId === id) {
        setHistory((prev) => {
          const updated = [...prev, newData];
          return updated.slice(-30);
        });
      }
    });

    return () => socket.off("newVitals");
  }, [id]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-blue-500 font-mono text-sm tracking-widest">
        <Clock className="animate-spin mr-2" /> DECRYPTING BIOMETRIC PACKETS...
      </div>
    );

  const current = history[history.length - 1];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-4 md:p-8 font-sans">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-white transition mb-8 uppercase text-[10px] font-black tracking-[0.2em]"
      >
        <ArrowLeft size={14} /> Return to Sector Hub
      </button>

      <div className="max-w-6xl mx-auto">
        {/* TOP PROFILE BAR */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-slate-800 pb-8 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-center text-blue-500">
              <User size={40} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                  {profile?.name || "Unknown Personnel"}
                </h1>
                <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[10px] font-bold font-mono">
                  {id}
                </span>
              </div>
              <div className="flex gap-4 mt-2 text-slate-500 font-mono text-[10px] uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <Shield size={12} /> {profile?.rank || "Unranked"}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={12} /> {profile?.unit || "No Unit"}
                </span>
                <span className="text-blue-500 font-bold">
                  Blood Group: {profile?.bloodGroup || "O+"}
                </span>
              </div>
            </div>
          </div>

          {current && (
            <div
              className={`px-6 py-3 rounded-2xl border flex items-center gap-3 ${
                current.riskLevel === "CRITICAL"
                  ? "bg-red-500/10 border-red-600 text-red-500 animate-pulse"
                  : current.riskLevel === "WARNING"
                  ? "bg-amber-500/10 border-amber-600 text-amber-500"
                  : "bg-emerald-500/10 border-emerald-600 text-emerald-500"
              }`}
            >
              <ShieldAlert size={20} />
              <span className="font-black text-xl tracking-tighter uppercase italic">
                {current.riskLevel}
              </span>
            </div>
          )}
        </header>

        {/* DATA GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            icon={<Activity className="text-red-500" />}
            label="Heart Rate"
            value={current?.heartRate}
            unit="BPM"
          />
          <StatCard
            icon={<Thermometer className="text-orange-500" />}
            label="Core Thermal"
            value={current?.temperature}
            unit="°C"
          />
          <StatCard
            icon={<Droplets className="text-blue-500" />}
            label="Oxygen Saturation"
            value={current?.spo2}
            unit="%"
          />
        </div>

        {/* CHARTS SECTION */}
        <div className="space-y-8">
          <ChartWrapper
            title="Biometric Heart Trend"
            color="#ef4444"
            data={history}
            dataKey="heartRate"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ChartWrapper
              title="Temperature Variance"
              color="#f97316"
              data={history}
              dataKey="temperature"
              isArea
            />
            <ChartWrapper
              title="O2 Stability Index"
              color="#3b82f6"
              data={history}
              dataKey="spo2"
              isArea
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, unit }) => (
  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] relative group hover:border-slate-700 transition-all shadow-xl">
    <div className="absolute top-6 right-6 opacity-30 group-hover:opacity-100 transition-opacity">
      {icon}
    </div>
    <p className="text-slate-600 text-[10px] uppercase font-black tracking-[0.2em] mb-2">
      {label}
    </p>
    <div className="flex items-baseline gap-2">
      <span className="text-5xl font-mono font-black text-white tracking-tighter">
        {value || "--"}
      </span>
      <span className="text-slate-600 text-xs font-bold uppercase">{unit}</span>
    </div>
  </div>
);

const ChartWrapper = ({ title, color, data, dataKey, isArea = false }) => (
  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl">
    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
      <span
        className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"
        style={{ backgroundColor: color }}
      ></span>
      {title}
    </h3>
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        {isArea ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis dataKey="timestamp" hide />
            <YAxis
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                border: "1px solid #1e293b",
                borderRadius: "12px",
                fontSize: "10px",
                color: "#fff",
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={`url(#grad${dataKey})`}
              strokeWidth={4}
            />
          </AreaChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis dataKey="timestamp" hide />
            <YAxis
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                border: "1px solid #1e293b",
                borderRadius: "12px",
                fontSize: "10px",
                color: "#fff",
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={4}
              dot={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  </div>
);

export default SoldierDetail;
