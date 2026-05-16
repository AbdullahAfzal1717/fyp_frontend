import { useEffect, useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Activity,
  AlertCircle,
  Clock,
  CheckCircle2,
  User,
} from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { useAuth } from "../../context/useAuth";

const AlertsLog = () => {
  const { socket } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [patientFilter, setPatientFilter] = useState("All Patients");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadAlerts = async () => {
    setLoading(true);
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

  // 1. Filter Logic (The "Brain")
  const filteredData = useMemo(() => {
    return alerts.filter((alert) => {
      const user = users.find((u) => u._id === alert.userId);
      const userName = user?.name?.toLowerCase() || "";
      const matchesSearch =
        userName.includes(searchTerm.toLowerCase()) ||
        alert.message?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        alert.riskLevel?.toLowerCase() === statusFilter.toLowerCase();

      const matchesPatient =
        patientFilter === "All Patients" || alert.userId === patientFilter;

      return matchesSearch && matchesStatus && matchesPatient;
    });
  }, [alerts, searchTerm, statusFilter, patientFilter, users]);

  // 2. Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Stats calculation based on ALL alerts
  const stats = useMemo(
    () => ({
      total: alerts.length,
      critical: alerts.filter((a) => a.riskLevel?.toLowerCase() === "critical")
        .length,
      pending: alerts.filter((a) => !a.isRead).length,
      resolved: alerts.filter((a) => a.isRead).length,
    }),
    [alerts],
  );

  return (
    <main className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alerts Log</h1>
            <p className="text-sm text-gray-500 mt-1">
              Real-time surveillance monitoring
            </p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Alerts",
              value: stats.total,
              icon: <Activity className="text-blue-600" />,
              bg: "bg-blue-50",
            },
            {
              label: "Critical",
              value: stats.critical,
              icon: <AlertCircle className="text-red-600" />,
              bg: "bg-red-50",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: <Clock className="text-amber-600" />,
              bg: "bg-amber-50",
            },
            {
              label: "Resolved",
              value: stats.resolved,
              icon: <CheckCircle2 className="text-emerald-600" />,
              bg: "bg-emerald-50",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm"
            >
              <div className={`${stat.bg} p-3 rounded-xl`}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search patient..."
              className="bg-transparent border-none focus:outline-none text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Patient Dropdown */}
          <div className="relative">
            <select
              className="appearance-none bg-gray-50 border border-gray-100 text-gray-700 text-sm rounded-xl px-4 py-2 pr-10 focus:outline-none cursor-pointer"
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

          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {["All", "Critical", "Caution", "Safe"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
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

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
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
              {paginatedData.map((alert) => (
                <tr
                  key={alert._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">
                      {users.find((u) => u._id === alert.userId)?.name ||
                        "User"}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate max-w-[200px]">
                      {alert.message}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        alert.riskLevel?.toLowerCase() === "critical"
                          ? "bg-red-50 text-red-600 border-red-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}
                    >
                      • {alert.riskLevel || "Caution"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(alert.createdAt).toLocaleString([], {
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
                      {alert.isRead ? "RESOLVED" : "PENDING"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Conditional Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing {paginatedData.length} of {filteredData.length} alerts
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AlertsLog;
