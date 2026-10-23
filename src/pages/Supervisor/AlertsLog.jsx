import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Activity,
  AlertCircle,
  Clock,
  CheckCircle2,
  User,
  X,
} from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { useAuth } from "../../context/useAuth";
import Pagination from "../../components/ui/Pagination";

function riskLabel(level) {
  if (level === "CRITICAL") return "Critical";
  if (level === "WARNING") return "Caution";
  return level || "—";
}

function matchesStatusFilter(alert, statusFilter) {
  if (statusFilter === "All") return true;
  const level = (alert.riskLevel || "").toUpperCase();
  if (statusFilter === "Critical") return level === "CRITICAL";
  if (statusFilter === "Caution") return level === "WARNING";
  if (statusFilter === "Safe") return level === "SAFE";
  return level === statusFilter.toUpperCase();
}

const AlertsLog = () => {
  const { socket } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [patientFilter, setPatientFilter] = useState("All Patients");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const userName = (userId) =>
    users.find((u) => String(u._id) === String(userId))?.name || "User";

  const loadAlerts = async () => {
    setLoading(true);
    setError("");
    try {
      const usersResponse = await api.get("/connections/my-users");
      const connectedUsers = usersResponse.data || [];
      setUsers(connectedUsers);

      const alertResponses = await Promise.allSettled(
        connectedUsers.map((user) => api.get(`/alerts/${user._id}`)),
      );

      const mergedAlerts = [];
      alertResponses.forEach((item) => {
        if (item.status === "fulfilled") mergedAlerts.push(...item.value.data);
      });
      mergedAlerts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setAlerts(mergedAlerts);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch alerts"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;

    const onAlert = (alert) => {
      if (!alert) return;
      setAlerts((prev) => {
        const exists = prev.some((a) => a._id === alert._id);
        if (exists) return prev;
        return [alert, ...prev];
      });
    };

    socket.on("alert:triggered", onAlert);
    return () => socket.off("alert:triggered", onAlert);
  }, [socket]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, patientFilter]);

  const filteredData = useMemo(() => {
    return alerts.filter((alert) => {
      const name = userName(alert.userId).toLowerCase();
      const matchesSearch =
        name.includes(searchTerm.toLowerCase()) ||
        alert.message?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = matchesStatusFilter(alert, statusFilter);

      const matchesPatient =
        patientFilter === "All Patients" ||
        String(alert.userId) === String(patientFilter);

      return matchesSearch && matchesStatus && matchesPatient;
    });
  }, [alerts, searchTerm, statusFilter, patientFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage,
  );

  const stats = useMemo(
    () => ({
      total: alerts.length,
      critical: alerts.filter((a) => a.riskLevel === "CRITICAL").length,
      pending: alerts.filter((a) => !a.isRead).length,
      resolved: alerts.filter((a) => a.isRead).length,
    }),
    [alerts],
  );

  async function openAlert(alert) {
    setSelected(alert);
    if (alert.isRead) return;
    try {
      const { data } = await api.patch(`/alerts/${alert._id}/read`);
      setAlerts((prev) =>
        prev.map((a) => (a._id === data._id ? data : a)),
      );
      setSelected(data);
    } catch {
      // still show details
    }
  }

  const snap = selected?.vitalsSnapshot;

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Alerts Log
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredData.length} shown
            {alerts.length !== filteredData.length
              ? ` · ${alerts.length} total`
              : ""}{" "}
            · tap a row for details
          </p>
        </header>

        {error && (
          <div className="mb-6 flex items-start gap-2 p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-600">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            {
              label: "Total Alerts",
              value: loading ? "—" : stats.total,
              icon: <Activity className="text-blue-600" size={18} />,
              bg: "bg-blue-50",
            },
            {
              label: "Critical",
              value: loading ? "—" : stats.critical,
              icon: <AlertCircle className="text-red-600" size={18} />,
              bg: "bg-red-50",
            },
            {
              label: "Pending",
              value: loading ? "—" : stats.pending,
              icon: <Clock className="text-amber-600" size={18} />,
              bg: "bg-amber-50",
            },
            {
              label: "Resolved",
              value: loading ? "—" : stats.resolved,
              icon: <CheckCircle2 className="text-emerald-600" size={18} />,
              bg: "bg-emerald-50",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 flex items-center gap-3 sm:gap-4 shadow-sm"
            >
              <div className={`${stat.bg} p-2.5 sm:p-3 rounded-xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col lg:flex-row lg:flex-wrap lg:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex-1 min-w-0">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search patient or message…"
              className="bg-transparent border-none focus:outline-none text-sm w-full min-w-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              className="appearance-none w-full bg-gray-50 border border-gray-100 text-gray-700 text-sm rounded-xl px-4 py-2 pr-10 focus:outline-none cursor-pointer"
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
            >
              <option value="All Patients">All Patients</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
            <User
              size={14}
              className="absolute right-3 top-3 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto">
            {["All", "Critical", "Caution"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === tab
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading && (
            <div className="p-4 space-y-3 border-b border-gray-50">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Loading alerts…
              </p>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-slate-50 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Mobile cards */}
          <div className={`md:hidden divide-y divide-gray-50 ${loading ? "hidden" : ""}`}>
            {paginatedData.length === 0 ? (
              <p className="p-6 text-sm text-gray-400 text-center">
                No alerts match filters.
              </p>
            ) : (
              paginatedData.map((alert) => (
                <button
                  key={alert._id}
                  type="button"
                  onClick={() => openAlert(alert)}
                  className="w-full text-left p-4 hover:bg-gray-50/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {userName(alert.userId)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {alert.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-2">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          alert.riskLevel === "CRITICAL"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                      >
                        {riskLabel(alert.riskLevel)}
                      </span>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Desktop table */}
          <table
            className={
              loading ? "hidden" : "hidden md:table w-full text-left"
            }
          >
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Patient
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Severity
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Time
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-sm text-gray-400"
                  >
                    No alerts match filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((alert) => (
                  <tr
                    key={alert._id}
                    onClick={() => openAlert(alert)}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!alert.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900">
                            {userName(alert.userId)}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate max-w-xs">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          alert.riskLevel === "CRITICAL"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                      >
                        • {riskLabel(alert.riskLevel)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(alert.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          alert.isRead
                            ? "text-emerald-500 bg-emerald-50"
                            : "text-amber-500 bg-amber-50"
                        }`}
                      >
                        {alert.isRead ? "READ" : "UNREAD"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filteredData.length}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close alert details"
            onClick={() => setSelected(null)}
          />
          <aside className="relative w-full max-w-md bg-white h-full shadow-2xl p-5 sm:p-6 overflow-y-auto animate-in slide-in-from-right">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Alert details
                </p>
                <h2 className="text-lg font-bold text-gray-900 mt-1">
                  {userName(selected.userId)}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl hover:bg-gray-50 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                selected.riskLevel === "CRITICAL"
                  ? "bg-red-50 text-red-600 border-red-100"
                  : "bg-amber-50 text-amber-600 border-amber-100"
              }`}
            >
              {riskLabel(selected.riskLevel)}
            </span>

            <p className="mt-4 text-sm text-gray-700 leading-relaxed font-medium">
              {selected.message}
            </p>
            <p className="mt-3 text-xs text-gray-400">
              {new Date(selected.createdAt).toLocaleString()}
            </p>

            {snap && (
              <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Vitals at alert
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {snap.heartRate ?? "--"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold">HR</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {snap.spo2 ?? "--"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold">SpO₂</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {snap.temperature ?? "--"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold">Temp</p>
                  </div>
                </div>
                {snap.activityState && (
                  <p className="mt-3 text-xs text-gray-500 text-center">
                    Activity: {snap.activityState}
                  </p>
                )}
              </div>
            )}

            <p className="mt-6 text-xs text-gray-400">
              Status:{" "}
              <span className="font-bold text-gray-600">
                {selected.isRead ? "Read" : "Unread"}
              </span>
            </p>
          </aside>
        </div>
      )}
    </main>
  );
};

export default AlertsLog;
