import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Activity,
  Bell,
  AlertTriangle,
  Heart,
  Thermometer,
  Wind,
  ChevronRight,
} from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { useAuth } from "../../context/useAuth";

const Dashboard = () => {
  const { socket } = useAuth();
  const [users, setUsers] = useState([]);
  const [riskByUser, setRiskByUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const usersResponse = await api.get("/connections/my-users");
      const connectedUsers = usersResponse.data || [];
      setUsers(connectedUsers);

      const riskResponses = await Promise.allSettled(
        connectedUsers.map((user) => api.get(`/ai/risk-score/${user._id}`)),
      );

      const mappedRisk = connectedUsers.reduce((acc, user, index) => {
        const item = riskResponses[index];
        if (item.status === "fulfilled") {
          acc[user._id] = item.value.data;
        }
        return acc;
      }, {});
      setRiskByUser(mappedRisk);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to load dashboard"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // 1. FIXED: Dynamic Filtering Logic
  const filteredUsers = useMemo(() => {
    if (filter === "All") return users;
    return users.filter((user) => {
      const risk = riskByUser[user._id];
      // Matches "CRITICAL", "CAUTION", or "SAFE" from your AI backend
      return risk?.riskLevel?.toUpperCase() === filter.toUpperCase();
    });
  }, [users, riskByUser, filter]);

  // 2. FIXED: Top Stats Logic
  const stats = useMemo(() => {
    const riskValues = Object.values(riskByUser);
    return [
      {
        label: "Total Patients",
        value: users.length,
        icon: <Users />,
        color: "bg-blue-50 text-blue-600",
        trend: "+0",
      },
      {
        label: "Active Now",
        value: users.length, // Currently assumes all connected are active
        sub: "Connected live",
        icon: <Activity />,
        color: "bg-emerald-50 text-emerald-600",
      },
      {
        label: "Risk Alerts",
        value: riskValues.filter((r) => r.riskLevel !== "SAFE").length,
        icon: <Bell />,
        color: "bg-amber-50 text-amber-600",
        trend: riskValues.filter((r) => r.riskLevel === "CRITICAL").length,
      },
      {
        label: "At Risk",
        value: riskValues.filter((r) => r.riskLevel === "CRITICAL").length,
        sub: "Requires Attention",
        icon: <AlertTriangle />,
        color: "bg-red-50 text-red-600",
        trend: "+1",
      },
    ];
  }, [riskByUser, users.length]);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-400 animate-pulse font-bold">
        Initializing Health Framework...
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-5 shadow-sm"
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${stat.color}`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
              </div>
              {stat.sub && (
                <p className="text-[10px] text-gray-400 font-medium">
                  {stat.sub}
                </p>
              )}
            </div>
          </div>
        ))}
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Patient Monitor */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Patient Monitor
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Showing {filteredUsers.length} patients based on {filter} status
              </p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {["All", "Critical", "Warning", "Safe"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filter === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredUsers.map((user) => {
              const risk = riskByUser[user._id];
              const isCritical = risk?.riskLevel === "CRITICAL";

              return (
                <div
                  key={user._id}
                  className={`bg-white rounded-[32px] border-2 p-6 transition-all hover:shadow-xl ${
                    isCritical
                      ? "border-red-100 bg-red-50/10 shadow-red-50"
                      : "border-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{user.name}</h4>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        isCritical
                          ? "bg-red-100 text-red-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      ● {risk?.riskLevel || "SAFE"}
                    </span>
                  </div>

                  {/* FIXED: Dynamic Vitals Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-red-50/50 p-3 rounded-2xl border border-red-50">
                      <div className="flex items-center gap-1 text-red-400 mb-1">
                        <Heart size={12} />{" "}
                        <span className="text-[10px] font-bold">HR</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {risk?.vitals?.heartRate || "--"}
                        <span className="text-[10px] text-gray-400 ml-1">
                          bpm
                        </span>
                      </p>
                    </div>
                    <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-50">
                      <div className="flex items-center gap-1 text-blue-400 mb-1">
                        <Wind size={12} />{" "}
                        <span className="text-[10px] font-bold">SpO2</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {risk?.vitals?.spo2 || "--"}
                        <span className="text-[10px] text-gray-400 ml-1">
                          %
                        </span>
                      </p>
                    </div>
                    <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-50">
                      <div className="flex items-center gap-1 text-amber-400 mb-1">
                        <Thermometer size={12} />{" "}
                        <span className="text-[10px] font-bold">Temp</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {risk?.vitals?.temperature || "--"}
                        <span className="text-[10px] text-gray-400 ml-1">
                          °C
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">
                        Risk Score
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isCritical ? "bg-red-500" : "bg-blue-500"}`}
                            style={{ width: `${risk?.riskScore || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-900">
                          {risk?.riskScore || 0}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/users/${user._id}`}
                      className="px-6 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-all"
                    >
                      View Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Dynamic Recent Alerts */}
        <aside className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Recent Risk Shifts</h3>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>

            <div className="space-y-4">
              {users
                .filter((u) => riskByUser[u._id]?.riskLevel !== "SAFE")
                .slice(0, 5)
                .map((user) => {
                  const risk = riskByUser[user._id];
                  return (
                    <div
                      key={user._id}
                      className="p-4 rounded-2xl border-l-4 bg-gray-50 border-red-500 transition-hover hover:bg-red-50/30"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-gray-900">
                          {user.name}
                        </span>
                        <span className="text-[10px] font-black uppercase text-red-600">
                          {risk?.riskLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Primary Risk:{" "}
                        <span className="text-red-600 font-bold">
                          {risk?.vitals?.heartRate > 100
                            ? "Tachycardia"
                            : "Abnormal Vitals"}
                        </span>
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                          Live Update
                        </span>
                        <span className="text-[9px] font-bold text-amber-600 uppercase">
                          Awaiting Review
                        </span>
                      </div>
                    </div>
                  );
                })}
              {users.length === 0 && (
                <p className="text-xs text-gray-400 text-center">
                  No active alerts
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
