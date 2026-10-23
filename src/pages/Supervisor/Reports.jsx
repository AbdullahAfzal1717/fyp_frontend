import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Search,
  Calendar,
  FileText,
  Download,
  Heart,
  Thermometer,
  Droplets,
  Bell,
  ChevronRight,
  Activity,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api, { getErrorMessage } from "../../services/api";

const PERIOD_BY_TYPE = {
  "Daily Summary": "1d",
  "Weekly Analysis": "7d",
  "Monthly Review": "30d",
};

const PERIOD_LABEL = {
  "1d": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

const StatCard = React.memo(
  ({ icon: Icon, label, value, unit, colorClass }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col gap-3 shadow-sm">
      <div
        className={`w-10 h-10 ${colorClass} rounded-xl flex items-center justify-center`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
          {label} <span className="lowercase font-medium">({unit})</span>
        </p>
      </div>
    </div>
  ),
);

const ConfigSection = ({ title, icon: Icon, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
      <Icon size={16} className="text-blue-600" /> {title}
    </div>
    {children}
  </div>
);

function formatRange(range) {
  if (!range?.from || !range?.to) return "—";
  const opts = { month: "short", day: "numeric", year: "numeric" };
  return `${new Date(range.from).toLocaleDateString([], opts)} → ${new Date(range.to).toLocaleDateString([], opts)}`;
}

const Reports = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [report, setReport] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [reportType, setReportType] = useState("Weekly Analysis");

  const period = PERIOD_BY_TYPE[reportType] || "7d";

  const selectedUser = useMemo(
    () => users.find((u) => String(u._id) === String(selectedUserId)) || null,
    [users, selectedUserId],
  );

  const fetchUserReport = useCallback(async (userId, periodKey) => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/reports/${userId}/generate`, {
        params: { period: periodKey },
      });
      const chartData =
        data.vitals
          ?.map((v) => ({
            time: new Date(v.timestamp).toLocaleString([], {
              month: periodKey === "1d" ? undefined : "short",
              day: periodKey === "1d" ? undefined : "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            hr: v.heartRate,
            risk: v.riskLevel,
          }))
          .reverse() || [];

      setReport({ ...data, chartData });
    } catch (err) {
      setReport(null);
      setError(getErrorMessage(err, "Failed to load report"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const { data } = await api.get("/connections/my-users");
        const list = data || [];
        setUsers(list);
        if (list.length > 0) {
          setSelectedUserId(String(list[0]._id));
        }
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load patients"));
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    fetchUserReport(selectedUserId, period);
  }, [selectedUserId, period, fetchUserReport]);

  const handleDownload = async () => {
    if (!selectedUserId || !selectedUser) return;
    setDownloading(true);
    try {
      const response = await api.get(`/reports/${selectedUserId}/download`, {
        responseType: "blob",
        params: { period },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const safe = (selectedUser.name || "patient").replace(/\s+/g, "_");
      link.setAttribute(
        "download",
        `HealthReport_${safe}_${period}.json`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(getErrorMessage(err, "Download failed. Please try again."));
    } finally {
      setDownloading(false);
    }
  };

  const filteredUsers = useMemo(
    () =>
      users.filter((u) =>
        (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [users, searchQuery],
  );

  const initials = (name) =>
    (name || "P")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full pb-8">
      {/* Selection panel */}
      <aside className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
        <div className="bg-white rounded-3xl border border-slate-100 flex flex-col overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-50">
            <ConfigSection title="Select Patient" icon={Users} />
            <p className="text-[11px] text-slate-400 font-medium mt-1 mb-3">
              Choose whose vitals go into the report / download
            </p>

            {/* Always-visible patient dropdown (esp. useful on mobile) */}
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
              Patient
            </label>
            <select
              className="w-full appearance-none bg-slate-50 border border-slate-100 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100 mb-3"
              value={selectedUserId}
              disabled={loadingUsers || users.length === 0}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {users.length === 0 ? (
                <option value="">No linked patients</option>
              ) : (
                users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))
              )}
            </select>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Filter list…"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-[240px] overflow-y-auto p-2 space-y-1">
            {loadingUsers ? (
              <p className="p-4 text-xs text-slate-400 animate-pulse">
                Loading patients…
              </p>
            ) : filteredUsers.length === 0 ? (
              <p className="p-4 text-xs text-slate-400 text-center">
                No patients match.
              </p>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => setSelectedUserId(String(user._id))}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                    String(selectedUserId) === String(user._id)
                      ? "bg-blue-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold ${
                      String(selectedUserId) === String(user._id)
                        ? "bg-blue-600"
                        : "bg-blue-400"
                    }`}
                  >
                    {initials(user.name)}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p
                      className={`text-sm font-bold truncate ${
                        String(selectedUserId) === String(user._id)
                          ? "text-blue-700"
                          : "text-slate-700"
                      }`}
                    >
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold tracking-tight truncate">
                      {user.email}
                    </p>
                  </div>
                  <ChevronRight
                    size={14}
                    className={
                      String(selectedUserId) === String(user._id)
                        ? "text-blue-400"
                        : "text-slate-200"
                    }
                  />
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <ConfigSection title="Report Period" icon={Calendar}>
            <p className="text-xs text-slate-500 font-medium">
              {PERIOD_LABEL[period]}
            </p>
            <p className="text-[11px] text-slate-400">
              {report?.range ? formatRange(report.range) : "Select a patient"}
            </p>
          </ConfigSection>

          <ConfigSection title="Report Type" icon={FileText}>
            <div className="space-y-2">
              {Object.keys(PERIOD_BY_TYPE).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setReportType(type)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all ${
                    reportType === type
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        reportType === type
                          ? "bg-blue-600 border-blue-600"
                          : "border-slate-300"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-700">{type}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {PERIOD_LABEL[PERIOD_BY_TYPE[type]]}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ConfigSection>
        </div>
      </aside>

      {/* Viewport */}
      <main className="flex-1 space-y-6 min-w-0">
        {/* Sticky download bar with patient context */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Download for
            </p>
            <p className="text-sm sm:text-base font-black text-slate-800 truncate">
              {selectedUser?.name || "No patient selected"}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              {PERIOD_LABEL[period]} · JSON export
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select
              className="sm:hidden appearance-none bg-slate-50 border border-slate-100 text-sm font-bold rounded-xl px-4 py-2.5"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedUserId || downloading || loading}
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-black shadow-lg shadow-blue-100"
            >
              {downloading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {downloading ? "Preparing…" : "Download report"}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-24 bg-white rounded-3xl border border-slate-100 animate-pulse" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse"
                />
              ))}
            </div>
            <div className="h-72 bg-white rounded-[2rem] border border-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-sm font-bold">
              Loading report for {selectedUser?.name || "patient"}…
            </div>
          </div>
        ) : report ? (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {initials(report.user?.name)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-black text-slate-800 truncate">
                    {report.user?.name}
                  </h2>
                  <p className="text-sm text-slate-400 font-medium truncate">
                    {report.user?.email} · {reportType}
                  </p>
                </div>
              </div>
              <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-500 tracking-wider uppercase self-start">
                {formatRange(report.range)}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                label="Avg Heart Rate"
                value={report.summary?.avgHeartRate ?? "--"}
                unit="bpm"
                icon={Heart}
                colorClass="bg-red-50 text-red-500"
              />
              <StatCard
                label="Avg SpO2"
                value={report.summary?.avgSpO2 ?? "--"}
                unit="%"
                icon={Droplets}
                colorClass="bg-blue-50 text-blue-500"
              />
              <StatCard
                label="Avg Temp"
                value={report.summary?.avgTemperature ?? "--"}
                unit="°C"
                icon={Thermometer}
                colorClass="bg-orange-50 text-orange-500"
              />
              <StatCard
                label="Total Alerts"
                value={report.summary?.totalAlerts ?? 0}
                unit="events"
                icon={Bell}
                colorClass="bg-blue-50 text-blue-600"
              />
            </div>

            <div className="bg-white p-5 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 sm:mb-10">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Activity size={18} className="text-blue-600" /> Heart Rate
                  Trend
                </h3>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full self-start">
                  {report.summary?.totalPoints ?? 0} points · {PERIOD_LABEL[period]}
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full">
                {(report.chartData?.length || 0) < 2 ? (
                  <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 text-center px-4">
                    Not enough vitals in this period for a chart.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={report.chartData}>
                      <defs>
                        <linearGradient
                          id="colorHr"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#2563eb"
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor="#2563eb"
                            stopOpacity={0}
                          />
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
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        dy={10}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        domain={["dataMin - 5", "dataMax + 5"]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
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
                        dataKey="hr"
                        stroke="#2563eb"
                        strokeWidth={3}
                        fill="url(#colorHr)"
                        animationDuration={800}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 grid grid-cols-3 gap-3 text-center sm:text-left">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Readings
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    {report.summary?.totalPoints ?? 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Risk Level
                  </p>
                  <p
                    className={`text-sm font-black ${
                      report.summary?.latestRisk === "CRITICAL"
                        ? "text-red-500"
                        : report.summary?.latestRisk === "WARNING"
                          ? "text-orange-500"
                          : "text-emerald-500"
                    }`}
                  >
                    {report.summary?.latestRisk || "SAFE"}
                  </p>
                </div>
                <div className="text-right sm:text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Activity
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    {report.summary?.latestActivity || "—"}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={downloading}
              onClick={handleDownload}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-blue-100"
            >
              {downloading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Download size={20} />
              )}
              Download report — {selectedUser?.name} ({PERIOD_LABEL[period]})
            </button>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-4 border-2 border-dashed border-slate-100 rounded-[2rem]">
            <FileText size={48} />
            <p className="font-medium text-center px-6">
              {users.length === 0
                ? "Link a patient first, then generate a report."
                : "Select a patient to preview their report."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;
