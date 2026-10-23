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

function PatientCardSkeleton() {
  return (
    <div className="bg-white rounded-4xl border border-gray-100 p-6 animate-pulse">
      <div className="flex gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-slate-100 rounded" />
          <div className="h-3 w-40 bg-slate-50 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-slate-50" />
        ))}
      </div>
      <div className="h-8 bg-slate-50 rounded-xl" />
    </div>
  );
}

function AlertSkeleton() {
  return (
    <div className="p-4 rounded-2xl border-l-4 border-slate-200 bg-slate-50 animate-pulse space-y-2">
      <div className="h-3 w-24 bg-slate-200 rounded" />
      <div className="h-3 w-full bg-slate-100 rounded" />
      <div className="h-2 w-20 bg-slate-100 rounded" />
    </div>
  );
}

const Dashboard = () => {
  const { socket } = useAuth();
  const [users, setUsers] = useState([]);
  const [riskByUser, setRiskByUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchDashboard = async (opts = { silent: false }) => {
    if (!opts.silent) setLoading(true);
    setError("");
    try {
      const usersResponse = await api.get("/connections/my-users");
      const connectedUsers = usersResponse.data || [];
      setUsers(connectedUsers);

      const riskResponses = await Promise.allSettled(
        connectedUsers.map((user) =>
          api.get(`/ai/risk-score/${user._id || user.id}`),
        ),
      );

      const mappedRisk = connectedUsers.reduce((acc, user, index) => {
        const item = riskResponses[index];
        const key = String(user._id || user.id);
        if (item.status === "fulfilled") {
          acc[key] = item.value.data;
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

  useEffect(() => {
    if (!socket) return undefined;

    const onVitalsUpdate = (payload) => {
      const uid = payload?.userId != null ? String(payload.userId) : null;
      const vital = payload?.vital;
      if (!uid || !vital) return;

      setRiskByUser((prev) => ({
        ...prev,
        [uid]: {
          userId: uid,
          riskLevel: vital.riskLevel,
          riskScore: vital.riskScore,
          timestamp: vital.timestamp,
          activityState: vital.activityState,
          vitals: {
            heartRate: vital.heartRate,
            spo2: vital.spo2,
            temperature: vital.temperature,
            activityState: vital.activityState,
          },
        },
      }));
    };

    const onAlert = () => {
      fetchDashboard({ silent: true });
    };

    socket.on("vitals:update", onVitalsUpdate);
    socket.on("alert:triggered", onAlert);
    return () => {
      socket.off("vitals:update", onVitalsUpdate);
      socket.off("alert:triggered", onAlert);
    };
  }, [socket]);

  const filteredUsers = useMemo(() => {
    if (filter === "All") return users;
    return users.filter((user) => {
      const risk = riskByUser[String(user._id || user.id)];
      return risk?.riskLevel?.toUpperCase() === filter.toUpperCase();
    });
  }, [users, riskByUser, filter]);

  const atRiskUsers = useMemo(
    () =>
      users.filter((u) => {
        const r = riskByUser[String(u._id || u.id)];
        return r && r.riskLevel !== "SAFE";
      }),
    [users, riskByUser],
  );

  const stats = useMemo(() => {
    const riskValues = Object.values(riskByUser);
    return [
      {
        label: "Total Patients",
        value: loading ? "—" : users.length,
        icon: <Users size={22} />,
        color: "bg-blue-50 text-blue-600",
      },
      {
        label: "Active Now",
        value: loading ? "—" : users.length,
        sub: "Connected live",
        icon: <Activity size={22} />,
        color: "bg-emerald-50 text-emerald-600",
      },
      {
        label: "Risk Alerts",
        value: loading
          ? "—"
          : riskValues.filter((r) => r.riskLevel !== "SAFE").length,
        icon: <Bell size={22} />,
        color: "bg-amber-50 text-amber-600",
      },
      {
        label: "At Risk",
        value: loading
          ? "—"
          : riskValues.filter((r) => r.riskLevel === "CRITICAL").length,
        sub: "Requires Attention",
        icon: <AlertTriangle size={22} />,
        color: "bg-red-50 text-red-600",
      },
    ];
  }, [riskByUser, users.length, loading]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 flex items-center gap-3 sm:gap-5 shadow-sm"
          >
            <div
              className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.color}`}
            >
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider truncate">
                {stat.label}
              </p>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                {stat.value}
              </span>
              {stat.sub && (
                <p className="text-[10px] text-gray-400 font-medium truncate">
                  {stat.sub}
                </p>
              )}
            </div>
          </div>
        ))}
      </section>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        <div className="flex-1 space-y-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Patient Monitor
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {loading
                  ? "Loading patients…"
                  : `Showing ${filteredUsers.length} patients · ${filter}`}
              </p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto max-w-full">
              {["All", "Critical", "Warning", "Safe"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {loading ? (
              <>
                <PatientCardSkeleton />
                <PatientCardSkeleton />
                <PatientCardSkeleton />
                <PatientCardSkeleton />
              </>
            ) : filteredUsers.length === 0 ? (
              <div className="md:col-span-2 p-10 text-center text-sm text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-3xl">
                No patients match this filter.
              </div>
            ) : (
              filteredUsers.map((user) => {
                const uid = String(user._id || user.id);
                const risk = riskByUser[uid];
                const level = risk?.riskLevel || "SAFE";
                const isCritical = level === "CRITICAL";
                const isWarning = level === "WARNING";

                return (
                  <div
                    key={uid}
                    className={`bg-white rounded-3xl sm:rounded-4xl border-2 p-5 sm:p-6 transition-all hover:shadow-xl ${
                      isCritical
                        ? "border-red-100 bg-red-50/10"
                        : isWarning
                          ? "border-amber-100"
                          : "border-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6 gap-3">
                      <div className="flex gap-3 sm:gap-4 min-w-0">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100 shrink-0">
                          {(user.name || "P")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">
                            {user.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shrink-0 ${
                          isCritical
                            ? "bg-red-100 text-red-600"
                            : isWarning
                              ? "bg-amber-100 text-amber-600"
                              : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        ● {level}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                      <div className="bg-red-50/50 p-2.5 sm:p-3 rounded-2xl border border-red-50">
                        <div className="flex items-center gap-1 text-red-400 mb-1">
                          <Heart size={12} />{" "}
                          <span className="text-[10px] font-bold">HR</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {risk?.vitals?.heartRate ?? "--"}
                          <span className="text-[10px] text-gray-400 ml-1">
                            bpm
                          </span>
                        </p>
                      </div>
                      <div className="bg-blue-50/50 p-2.5 sm:p-3 rounded-2xl border border-blue-50">
                        <div className="flex items-center gap-1 text-blue-400 mb-1">
                          <Wind size={12} />{" "}
                          <span className="text-[10px] font-bold">SpO2</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {risk?.vitals?.spo2 ?? "--"}
                          <span className="text-[10px] text-gray-400 ml-1">
                            %
                          </span>
                        </p>
                      </div>
                      <div className="bg-amber-50/50 p-2.5 sm:p-3 rounded-2xl border border-amber-50">
                        <div className="flex items-center gap-1 text-amber-400 mb-1">
                          <Thermometer size={12} />{" "}
                          <span className="text-[10px] font-bold">Temp</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {risk?.vitals?.temperature ?? "--"}
                          <span className="text-[10px] text-gray-400 ml-1">
                            °C
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-3">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          Risk Score
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 sm:w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${isCritical ? "bg-red-500" : "bg-blue-500"}`}
                              style={{
                                width: `${Math.min(100, risk?.riskScore || 0)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-900">
                            {risk?.riskScore ?? 0}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/users/${uid}`}
                        className="px-4 sm:px-6 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-all shrink-0"
                      >
                        Details <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Alerts sidebar — loader lives HERE */}
        <aside className="w-full lg:w-80 space-y-6 shrink-0">
          <div className="bg-white rounded-3xl sm:rounded-4xl border border-gray-100 p-5 sm:p-6 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Recent Risk Shifts</h3>
              <div
                className={`w-2 h-2 rounded-full ${
                  loading ? "bg-amber-400 animate-pulse" : "bg-emerald-500 animate-pulse"
                }`}
              />
            </div>

            <div className="space-y-4 min-h-40">
              {loading ? (
                <>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Loading alerts…
                  </p>
                  <AlertSkeleton />
                  <AlertSkeleton />
                  <AlertSkeleton />
                </>
              ) : atRiskUsers.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">
                  No active risk alerts right now.
                </p>
              ) : (
                atRiskUsers.slice(0, 5).map((user) => {
                  const uid = String(user._id || user.id);
                  const risk = riskByUser[uid];
                  const isCritical = risk?.riskLevel === "CRITICAL";
                  return (
                    <Link
                      key={uid}
                      to={`/users/${uid}`}
                      className={`block p-4 rounded-2xl border-l-4 bg-gray-50 hover:bg-red-50/30 transition-colors ${
                        isCritical ? "border-red-500" : "border-amber-400"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {user.name}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase shrink-0 ${
                            isCritical ? "text-red-600" : "text-amber-600"
                          }`}
                        >
                          {risk?.riskLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Primary Risk:{" "}
                        <span
                          className={`font-bold ${
                            isCritical ? "text-red-600" : "text-amber-600"
                          }`}
                        >
                          {risk?.vitals?.heartRate > 100
                            ? "Tachycardia"
                            : "Abnormal Vitals"}
                        </span>
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                          Live Update
                        </span>
                        <span className="text-[9px] font-bold text-blue-600 uppercase">
                          View patient →
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {!loading && (
              <Link
                to="/alerts"
                className="mt-5 block text-center text-xs font-bold text-blue-600 hover:underline"
              >
                Open full alerts log
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
