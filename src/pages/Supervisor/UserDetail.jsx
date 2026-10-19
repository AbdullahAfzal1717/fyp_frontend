import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ArrowLeft,
  Heart,
  Droplets,
  Thermometer,
  Activity,
  ChevronUp,
  ChevronDown,
  Zap,
  Clock,
} from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { useAuth } from "../../context/useAuth";

// --- Sub-Components (DRY) ---

const VitalCard = ({
  icon: Icon,
  label,
  value,
  unit,
  min,
  max,
  trend,
  colorClass,
  shadowClass,
}) => (
  <div
    className={`bg-white p-6 rounded-4xl border border-slate-100 shadow-sm relative overflow-hidden group transition-all hover:shadow-md`}
  >
    <div className="flex justify-between items-start mb-4">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} bg-opacity-10 ${colorClass.replace("bg-", "text-")}`}
      >
        <Icon size={20} />
      </div>
      <div
        className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${trend === "up" ? "text-red-500" : "text-emerald-500"}`}
      >
        {trend}{" "}
        {trend === "up" ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </div>
    </div>

    <div className="space-y-1">
      <p className="text-sm font-bold text-slate-400">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black text-slate-800">{value}</span>
        <span className="text-sm font-bold text-slate-400">{unit}</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-50">
      <div>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
          Min Today
        </p>
        <p
          className={`text-xs font-black ${colorClass.replace("bg-", "text-")}`}
        >
          {min} {unit}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
          Max Today
        </p>
        <p className="text-xs font-black text-red-400">
          {max} {unit}
        </p>
      </div>
    </div>
  </div>
);

// --- Main Component ---

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { socket } = useAuth();

  const [liveVital, setLiveVital] = useState(null);
  const [history, setHistory] = useState([]);
  const [risk, setRisk] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Heart Rate");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [liveRes, historyRes, riskRes, alertsRes, usersRes] =
        await Promise.allSettled([
          api.get(`/vitals/${userId}/live`),
          api.get(`/vitals/${userId}/history`),
          api.get(`/ai/risk-score/${userId}`),
          api.get(`/alerts/${userId}`),
          api.get(`/connections/my-users`),
        ]);

      if (liveRes.status === "fulfilled") setLiveVital(liveRes.value.data);
      if (historyRes.status === "fulfilled")
        setHistory(historyRes.value.data || []);
      if (riskRes.status === "fulfilled") setRisk(riskRes.value.data);
      if (alertsRes.status === "fulfilled")
        setAlerts(alertsRes.value.data || []);
      if (usersRes.status === "fulfilled") {
        const match = (usersRes.value.data || []).find(
          (u) => String(u._id) === String(userId),
        );
        setPatient(match || null);
      }
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!socket) return;
    const onVitalsUpdate = (payload) => {
      if (String(payload.userId) !== String(userId)) return;
      setLiveVital(payload.vital);
      setRisk({
        riskLevel: payload.vital.riskLevel,
        riskScore: payload.vital.riskScore,
      });
      setHistory((prev) => [payload.vital, ...prev].slice(0, 100));
    };
    socket.on("vitals:update", onVitalsUpdate);
    return () => socket.off("vitals:update", onVitalsUpdate);
  }, [socket, userId]);

  const chartData = useMemo(
    () =>
      [...history].reverse().map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        val:
          activeTab === "Heart Rate"
            ? item.heartRate
            : activeTab === "SpO2"
              ? item.spo2
              : item.temperature,
      })),
    [history, activeTab],
  );

  const rangeFor = useCallback((key) => {
    const values = history
      .map((h) => Number(h[key]))
      .filter((n) => Number.isFinite(n));
    if (!values.length) {
      return { min: "--", max: "--", trend: "down" };
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const latest = values[0];
    const prev = values[1] ?? latest;
    return {
      min: key === "temperature" ? min.toFixed(1) : Math.round(min),
      max: key === "temperature" ? max.toFixed(1) : Math.round(max),
      trend: latest >= prev ? "up" : "down",
    };
  }, [history]);

  const hrStats = useMemo(() => rangeFor("heartRate"), [rangeFor]);
  const spo2Stats = useMemo(() => rangeFor("spo2"), [rangeFor]);
  const tempStats = useMemo(() => rangeFor("temperature"), [rangeFor]);

  if (loading)
    return (
      <div className="p-8 text-slate-400 animate-pulse">
        Loading patient profile...
      </div>
    );

  return (
    <div className="space-y-6 max-w-400 mx-auto pb-10">
      {/* 1. TOP NAVIGATION */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs transition-colors group"
      >
        <ArrowLeft
          size={14}
          className="group-hover:-translate-x-1 transition-transform"
        />{" "}
        BACK TO DASHBOARD
      </button>

      {/* 2. PATIENT IDENTITY HEADER */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl sm:rounded-4xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-lg shadow-blue-100 shrink-0">
            {(patient?.name || "P")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 truncate">
              {patient?.name || "Patient profile"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs font-bold text-slate-400 truncate">
                {patient?.email || "Linked patient"}
              </span>
              {liveVital?.activityState && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                  <span className="text-xs font-bold text-slate-400">
                    {liveVital.activityState}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Risk Score
            </p>
            <p className="text-3xl font-black text-orange-500">
              {risk?.riskScore != null ? risk.riskScore : "--"}
            </p>
          </div>
          <div
            className={`px-5 py-2.5 rounded-2xl text-xs font-black border ${
              risk?.riskLevel === "CRITICAL"
                ? "bg-red-50 border-red-100 text-red-600"
                : risk?.riskLevel === "WARNING"
                  ? "bg-amber-50 border-amber-100 text-amber-600"
                  : "bg-emerald-50 border-emerald-100 text-emerald-600"
            }`}
          >
            ● {risk?.riskLevel || "SAFE"} RISK
          </div>
        </div>
      </div>

      {/* 3. VITALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <VitalCard
          icon={Heart}
          label="Heart Rate"
          value={liveVital?.heartRate ?? "--"}
          unit="bpm"
          min={hrStats.min}
          max={hrStats.max}
          trend={hrStats.trend}
          colorClass="bg-red-500"
        />
        <VitalCard
          icon={Droplets}
          label="SpO2"
          value={liveVital?.spo2 ?? "--"}
          unit="%"
          min={spo2Stats.min}
          max={spo2Stats.max}
          trend={spo2Stats.trend}
          colorClass="bg-blue-500"
        />
        <VitalCard
          icon={Thermometer}
          label="Temperature"
          value={
            liveVital?.temperature != null
              ? Number(liveVital.temperature).toFixed(1)
              : "--"
          }
          unit="°C"
          min={tempStats.min}
          max={tempStats.max}
          trend={tempStats.trend}
          colorClass="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 4. MAIN CHART AREA */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex bg-slate-50 p-1 rounded-2xl">
              {["Heart Rate", "SpO2", "Temp"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {["1H", "6H", "24H", "7D"].map((t) => (
                <button
                  key={t}
                  className={`w-10 h-8 rounded-lg text-[10px] font-black ${t === "24H" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-50"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#cbd5e1" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#cbd5e1" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  fill="url(#colorVal)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. SIDEBAR: AI ANALYSIS & HISTORY */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-4xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Zap size={16} className="text-blue-600" /> AI ANALYSIS
              </h3>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-tighter">
                Live
              </span>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl mb-6">
              <p className="text-sm font-black text-orange-600">
                Moderate Risk — Monitor Closely
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Analysis
              </p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Some vitals are trending outside normal ranges. Heart rate
                averaging 140 bpm with SpO2 at 88.5%. Consider scheduling a
                check-in call soon.
              </p>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Activity size={16} className="text-blue-600 shrink-0" />
                <p className="text-[11px] font-bold text-slate-700">
                  Increase monitoring frequency. Consider check-in.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">
                Current Activity
              </p>
              <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black inline-block">
                Running
              </div>
            </div>
          </section>

          {/* Recent Alert List */}
          <section className="bg-white rounded-4xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-6">
              Alert History{" "}
              <span className="text-slate-300 ml-1 font-bold text-xs">
                ({alerts.length})
              </span>
            </h3>
            <div className="space-y-4">
              {alerts.slice(0, 3).map((alert, i) => (
                <div
                  key={alert._id || i}
                  className="flex justify-between items-start"
                >
                  <div>
                    <p className="text-xs font-black text-slate-700">
                      {alert.message}
                    </p>
                    <p className="text-[10px] font-bold text-slate-300 flex items-center gap-1 mt-1">
                      <Clock size={10} />{" "}
                      {new Date(alert.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-tighter">
                    Caution
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
