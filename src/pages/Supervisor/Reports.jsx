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

// --- Sub-Components (DRY & Memoized) ---

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

// --- Main Component ---

const Reports = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportType, setReportType] = useState("Daily Summary");

  // Fetch initial patient list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/connections/my-users");
        setUsers(data || []);
        if (data?.length > 0) fetchUserReport(data[0]);
      } catch (err) {
        console.error(getErrorMessage(err));
      }
    };
    fetchUsers();
  }, []);

  const fetchUserReport = useCallback(async (user) => {
    setSelectedUser(user);
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/${user._id}/generate`);
      // Transform backend vitals for Recharts
      const chartData =
        data.vitals
          ?.map((v) => ({
            time: new Date(v.timestamp).toLocaleTimeString([], {
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
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownload = async () => {
    if (!selectedUser) return;
    try {
      const response = await api.get(`/reports/${selectedUser._id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `HealthReport_${selectedUser.name}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Download failed. Please try again.");
    }
  };

  const filteredUsers = useMemo(
    () =>
      users.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [users, searchQuery],
  );

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full">
      {/* 1. SELECTION & CONFIG PANEL */}
      <aside className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
        {/* Patient List Card */}
        <div className="bg-white rounded-3xl border border-slate-100 flex flex-col overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-50">
            <ConfigSection title="Select Patient" icon={Users} />
            <div className="relative mt-4">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
            {filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => fetchUserReport(user)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedUser?._id === user._id ? "bg-blue-50" : "hover:bg-slate-50"}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold ${selectedUser?._id === user._id ? "bg-blue-600" : "bg-blue-400"}`}
                >
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1 text-left">
                  <p
                    className={`text-sm font-bold ${selectedUser?._id === user._id ? "text-blue-700" : "text-slate-700"}`}
                  >
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold tracking-tight">
                    Post-Surgery Recovery
                  </p>
                </div>
                <ChevronRight
                  size={14}
                  className={
                    selectedUser?._id === user._id
                      ? "text-blue-400"
                      : "text-slate-200"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <ConfigSection title="Date Range" icon={Calendar}>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">
                  FROM
                </label>
                <div className="w-full p-3 bg-slate-50 rounded-xl text-sm text-slate-600 flex justify-between items-center cursor-not-allowed">
                  29/04/2026 <Calendar size={14} className="text-slate-300" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">
                  TO
                </label>
                <div className="w-full p-3 bg-slate-50 rounded-xl text-sm text-slate-600 flex justify-between items-center cursor-not-allowed">
                  06/05/2026 <Calendar size={14} className="text-slate-300" />
                </div>
              </div>
            </div>
          </ConfigSection>

          <ConfigSection title="Report Type" icon={FileText}>
            <div className="space-y-2">
              {["Daily Summary", "Weekly Analysis", "Monthly Review"].map(
                (type) => (
                  <div
                    key={type}
                    onClick={() => setReportType(type)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${reportType === type ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100"}`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full border-2 ${reportType === type ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}
                      />
                      <p className="text-sm font-bold text-slate-700">{type}</p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </ConfigSection>
        </div>
      </aside>

      {/* 2. DYNAMIC VIEWPORT */}
      <main className="flex-1 space-y-6">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 animate-pulse">
            Loading report data...
          </div>
        ) : report ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            {/* Patient Info Header */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                  {report.user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">
                    {report.user.name}
                  </h2>
                  <p className="text-sm text-slate-400 font-medium">
                    Hypertension • Daily Report
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                  2026-04-29 → 2026-05-06
                </span>
                <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-100 transition-colors">
                  Preview
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Avg Heart Rate"
                value={report.summary.avgHeartRate}
                unit="bpm"
                icon={Heart}
                colorClass="bg-red-50 text-red-500"
              />
              <StatCard
                label="Avg SpO2"
                value={report.summary.avgSpO2}
                unit="%"
                icon={Droplets}
                colorClass="bg-blue-50 text-blue-500"
              />
              <StatCard
                label="Avg Temp"
                value={report.summary.avgTemperature}
                unit="°C"
                icon={Thermometer}
                colorClass="bg-orange-50 text-orange-500"
              />
              <StatCard
                label="Total Alerts"
                value="4"
                unit="events"
                icon={Bell}
                colorClass="bg-blue-50 text-blue-600"
              />
            </div>

            {/* Chart Section */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Activity size={18} className="text-blue-600" /> Heart Rate
                  Trend — Daily
                </h3>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full">
                  Real-time Data
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report.chartData}>
                    <defs>
                      <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
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
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center text-center">
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Session Duration
                  </p>
                  <p className="text-sm font-black text-slate-900">2h 14m</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Risk Level
                  </p>
                  <p className="text-sm font-black text-orange-500">Caution</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Activity State
                  </p>
                  <p className="text-sm font-black text-slate-900">Running</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleDownload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-blue-100"
            >
              <Download size={20} /> Download PDF Report
            </button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 border-2 border-dashed border-slate-100 rounded-[2rem]">
            <FileText size={48} />
            <p className="font-medium">
              No report generated for this user yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;
