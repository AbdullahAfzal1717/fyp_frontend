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

const RANGE_MS = {
  "1H": 1 * 3600e3,
  "6H": 6 * 3600e3,
  "24H": 24 * 3600e3,
  "7D": 7 * 24 * 3600e3,
};

const VitalCard = ({
  icon: Icon,
  label,
  value,
  unit,
  min,
  max,
  trend,
  colorClass,
  rangeLabel,
}) => (
  <div className="bg-white p-4 sm:p-6 rounded-3xl sm:rounded-4xl border border-slate-100 shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
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
        <span className="text-3xl sm:text-4xl font-black text-slate-800">
          {value}
        </span>
        <span className="text-sm font-bold text-slate-400">{unit}</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-50">
      <div>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
          Min ({rangeLabel})
        </p>
        <p
          className={`text-xs font-black ${colorClass.replace("bg-", "text-")}`}
        >
          {min} {unit}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
          Max ({rangeLabel})
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
  const [timeRange, setTimeRange] = useState("24H");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [visibleAlerts, setVisibleAlerts] = useState(4);

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

  const filteredHistory = useMemo(() => {
    const windowMs = RANGE_MS[timeRange] ?? RANGE_MS["24H"];
    const now = Date.now();
    return history.filter((v) => {
      const ts = new Date(v.timestamp).getTime();
      return Number.isFinite(ts) && now - ts <= windowMs;
    });
  }, [history, timeRange]);

  const chartData = useMemo(() => {
    const chronological = [...filteredHistory].reverse();
    const trimmed =
      chronological.length > 60
        ? chronological.slice(-60)
        : chronological;
    return trimmed.map((item) => ({
      time: new Date(item.timestamp).toLocaleString([], {
        month: timeRange === "7D" ? "short" : undefined,
        day: timeRange === "7D" ? "numeric" : undefined,
        hour: "2-digit",
        minute: "2-digit",
      }),
      val:
        activeTab === "Heart Rate"
          ? item.heartRate
          : activeTab === "SpO2"
            ? item.spo2
            : item.temperature,
    }));
  }, [filteredHistory, activeTab, timeRange]);

  const rangeFor = useCallback(
    (key) => {
      const values = filteredHistory
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
    },
    [filteredHistory],
  );

  const hrStats = useMemo(() => rangeFor("heartRate"), [rangeFor]);
  const spo2Stats = useMemo(() => rangeFor("spo2"), [rangeFor]);
  const tempStats = useMemo(() => rangeFor("temperature"), [rangeFor]);

  async function openAlert(alert) {
    setSelectedAlert(alert);
    if (alert.isRead) return;
    try {
      const { data } = await api.patch(`/alerts/${alert._id}/read`);
      setAlerts((prev) => prev.map((a) => (a._id === data._id ? data : a)));
      setSelectedAlert(data);
    } catch {
      // keep panel open
    }
  }

  const analysisText = useMemo(() => {
    const level = risk?.riskLevel || liveVital?.riskLevel || "SAFE";
    const score =
      risk?.riskScore != null
        ? risk.riskScore
        : liveVital?.riskScore != null
          ? liveVital.riskScore
          : null;
    if (level === "CRITICAL") {
      return `Critical risk${score != null ? ` (score ${score})` : ""}. Immediate review recommended based on latest vitals.`;
    }
    if (level === "WARNING") {
      return `Elevated risk${score != null ? ` (score ${score})` : ""}. Monitor closely — recent readings are outside preferred bands.`;
    }
    return `Patient currently in a safe band${score != null ? ` (score ${score})` : ""}. Continue routine monitoring.`;
  }, [risk, liveVital]);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <VitalCard
          icon={Heart}
          label="Heart Rate"
          value={liveVital?.heartRate ?? "--"}
          unit="bpm"
          min={hrStats.min}
          max={hrStats.max}
          trend={hrStats.trend}
          colorClass="bg-red-500"
          rangeLabel={timeRange}
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
          rangeLabel={timeRange}
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
          rangeLabel={timeRange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* 4. MAIN CHART AREA */}
        <div className="lg:col-span-8 bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10">
            <div className="flex bg-slate-50 p-1 rounded-2xl overflow-x-auto">
              {["Heart Rate", "SpO2", "Temp"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {["1H", "6H", "24H", "7D"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeRange(t)}
                  className={`w-10 h-8 rounded-lg text-[10px] font-black ${t === timeRange ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-50"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs font-bold text-slate-400 mb-4">
            {filteredHistory.length} reading
            {filteredHistory.length === 1 ? "" : "s"} in {timeRange}
            {history.length !== filteredHistory.length
              ? ` · ${history.length} total stored`
              : ""}
            {chartData.length > 0 && chartData.length < filteredHistory.length
              ? ` · chart shows last ${chartData.length}`
              : ""}
          </p>

          <div className="h-64 sm:h-80 w-full">
            {chartData.length < 2 ? (
              <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 px-6 text-center">
                {filteredHistory.length === 0
                  ? `No readings in ${timeRange}. Try a wider range.`
                  : "Need at least 2 points for a chart in this range."}
              </div>
            ) : (
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
                    interval="preserveStartEnd"
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
            )}
          </div>
        </div>

        {/* 5. SIDEBAR: AI ANALYSIS & HISTORY */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-3xl sm:rounded-4xl border border-slate-100 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Zap size={16} className="text-blue-600" /> AI ANALYSIS
              </h3>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-tighter">
                Live
              </span>
            </div>

            <div
              className={`p-4 border rounded-2xl mb-6 ${
                risk?.riskLevel === "CRITICAL"
                  ? "bg-red-50 border-red-100"
                  : risk?.riskLevel === "WARNING"
                    ? "bg-orange-50 border-orange-100"
                    : "bg-emerald-50 border-emerald-100"
              }`}
            >
              <p
                className={`text-sm font-black ${
                  risk?.riskLevel === "CRITICAL"
                    ? "text-red-600"
                    : risk?.riskLevel === "WARNING"
                      ? "text-orange-600"
                      : "text-emerald-600"
                }`}
              >
                {risk?.riskLevel || "SAFE"} — score{" "}
                {risk?.riskScore != null ? risk.riskScore : "--"}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Analysis
              </p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {analysisText}
              </p>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Activity size={16} className="text-blue-600 shrink-0" />
                <p className="text-[11px] font-bold text-slate-700">
                  HR {liveVital?.heartRate ?? "--"} · SpO₂{" "}
                  {liveVital?.spo2 ?? "--"} · Temp{" "}
                  {liveVital?.temperature != null
                    ? Number(liveVital.temperature).toFixed(1)
                    : "--"}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">
                Current Activity
              </p>
              <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black inline-block">
                {liveVital?.activityState || "—"}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl sm:rounded-4xl border border-slate-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-2">
              Alert History{" "}
              <span className="text-slate-300 ml-1 font-bold text-xs">
                ({alerts.length})
              </span>
            </h3>
            <p className="text-[10px] font-bold text-slate-400 mb-4">
              Tap an alert for details
            </p>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium">
                  No alerts for this patient.
                </p>
              ) : (
                alerts.slice(0, visibleAlerts).map((alert, i) => (
                  <button
                    key={alert._id || i}
                    type="button"
                    onClick={() => openAlert(alert)}
                    className="w-full text-left flex justify-between items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!alert.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                        <p className="text-xs font-black text-slate-700 line-clamp-2">
                          {alert.message}
                        </p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-300 flex items-center gap-1 mt-1">
                        <Clock size={10} />{" "}
                        {new Date(alert.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-tighter shrink-0 ${
                        alert.riskLevel === "CRITICAL"
                          ? "text-red-500"
                          : "text-orange-400"
                      }`}
                    >
                      {alert.riskLevel === "CRITICAL" ? "Critical" : "Caution"}
                    </span>
                  </button>
                ))
              )}
            </div>
            {alerts.length > visibleAlerts && (
              <button
                type="button"
                onClick={() => setVisibleAlerts((n) => n + 4)}
                className="mt-4 w-full text-xs font-bold text-blue-600 py-2"
              >
                Show more ({alerts.length - visibleAlerts} left)
              </button>
            )}
          </section>
        </div>
      </div>

      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close"
            onClick={() => setSelectedAlert(null)}
          />
          <aside className="relative w-full max-w-md bg-white h-full shadow-2xl p-5 sm:p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-black text-slate-800">
                Alert details
              </h2>
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 text-sm font-bold"
              >
                Close
              </button>
            </div>
            <p
              className={`text-xs font-black uppercase ${
                selectedAlert.riskLevel === "CRITICAL"
                  ? "text-red-500"
                  : "text-orange-500"
              }`}
            >
              {selectedAlert.riskLevel}
            </p>
            <p className="mt-3 text-sm text-slate-600 font-medium leading-relaxed">
              {selectedAlert.message}
            </p>
            <p className="mt-3 text-xs text-slate-400">
              {new Date(selectedAlert.createdAt).toLocaleString()}
            </p>
            {selectedAlert.vitalsSnapshot && (
              <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600 space-y-1">
                <p>
                  HR {selectedAlert.vitalsSnapshot.heartRate ?? "--"} · SpO₂{" "}
                  {selectedAlert.vitalsSnapshot.spo2 ?? "--"} · Temp{" "}
                  {selectedAlert.vitalsSnapshot.temperature ?? "--"}
                </p>
                <p>
                  Activity:{" "}
                  {selectedAlert.vitalsSnapshot.activityState || "—"}
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
