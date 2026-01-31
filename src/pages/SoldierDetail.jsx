import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
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
} from "lucide-react";

const SoldierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/vitals/${id}`);
        // Reverse history to show oldest to newest on X-axis
        setHistory([...response.data].reverse());
        setError(null);
      } catch (err) {
        setError("Failed to sync with tactical database");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-blue-400 font-mono">
        <Clock className="animate-spin mr-2" /> ACCESSING ENCRYPTED DATA...
      </div>
    );

  const current = history[history.length - 1];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-4 md:p-8 font-sans">
      {/* Header Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition mb-6 group"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Command Overview
      </button>

      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">
              Soldier <span className="text-blue-500">{id}</span>
            </h1>
            <p className="text-slate-500 font-mono text-sm mt-1">
              BIOMETRIC ENCRYPTED FEED // CHANNEL_04
            </p>
          </div>

          {current && (
            <div
              className={`px-6 py-3 rounded-xl border-2 flex items-center gap-3 ${
                current.riskLevel === "CRITICAL"
                  ? "bg-red-500/10 border-red-500 text-red-500 animate-pulse"
                  : current.riskLevel === "WARNING"
                  ? "bg-amber-500/10 border-amber-500 text-amber-500"
                  : "bg-emerald-500/10 border-emerald-500 text-emerald-500"
              }`}
            >
              <ShieldAlert size={24} />
              <span className="font-black text-xl tracking-tighter uppercase">
                {current.riskLevel} STATUS
              </span>
            </div>
          )}
        </header>

        {/* Vital Stats Quick Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Activity className="text-red-500" />}
            label="Heart Rate"
            value={current?.heartRate}
            unit="BPM"
            color="#ef4444"
          />
          <StatCard
            icon={<Thermometer className="text-orange-500" />}
            label="Body Temp"
            value={current?.temperature}
            unit="°C"
            color="#f97316"
          />
          <StatCard
            icon={<Droplets className="text-blue-500" />}
            label="Oxygen (SpO2)"
            value={current?.spo2}
            unit="%"
            color="#3b82f6"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8">
          <ChartContainer
            title="Pulse Waveform (Heart Rate)"
            color="#ef4444"
            data={history}
            dataKey="heartRate"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ChartContainer
              title="Thermal History"
              color="#f97316"
              data={history}
              dataKey="temperature"
              isArea
            />
            <ChartContainer
              title="Oxygen Saturation"
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

// Reusable Stat Card
const StatCard = ({ icon, label, value, unit, color }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition">
      {icon}
    </div>
    <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">
      {label}
    </p>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-mono font-bold text-white">
        {value || "--"}
      </span>
      <span className="text-slate-500 text-sm">{unit}</span>
    </div>
  </div>
);

// Reusable Chart Container
const ChartContainer = ({ title, color, data, dataKey, isArea = false }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      ></div>
      {title}
    </h3>
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {isArea ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id={`color${dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
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
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
              itemStyle={{ color: color }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fillOpacity={1}
              fill={`url(#color${dataKey})`}
              strokeWidth={3}
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
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
              itemStyle={{ color: color }}
            />
            <Line
              type="stepAfter"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  </div>
);

export default SoldierDetail;
