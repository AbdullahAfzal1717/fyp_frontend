import { useState, useEffect } from "react";
import api from "../../../services/api";
import {
  ShieldAlert,
  UserPlus,
  List,
  Loader2,
  Lock,
  Mail,
  User,
  Globe,
} from "lucide-react";
import { TacticalInput } from "../../../components/ui/Input";
import CommanderNode from "../../../components/Admin/CommanderNode";

const SuperAdminDashboard = () => {
  const [commanders, setCommanders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    region: "",
  });

  const fetchCommanders = async () => {
    try {
      const res = await api.get("/admin/commanders");
      setCommanders(res.data);
    } catch (err) {
      console.error("GHQ Link Failure");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommanders();
  }, []);

  const handleCreateCommander = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/create-commander", formData);
      setFormData({ name: "", email: "", password: "", region: "" });
      fetchCommanders(); // Refresh list
    } catch (err) {
      alert("Registration Failed: Insufficient Clearance");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-500 font-mono">
        <Loader2 className="animate-spin mb-4" />
        <span className="text-[10px] tracking-[0.4em]">
          AUTHENTICATING GHQ ACCESS...
        </span>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 border-b border-slate-800 pb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              GHQ Command Center
            </h1>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-2">
              Strategic Personnel Management :: LEVEL_5_CLEARANCE
            </p>
          </div>
          <div className="px-5 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-500 flex items-center gap-3 animate-pulse">
            <ShieldAlert size={20} />
            <span className="font-black text-[10px] uppercase tracking-widest">
              Administrator Node
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Appointment Form */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl h-fit">
            <h3 className="text-sm font-black mb-8 flex items-center gap-3 text-emerald-500 uppercase tracking-[0.2em]">
              <UserPlus size={18} /> Appoint Commander
            </h3>
            <form onSubmit={handleCreateCommander} className="space-y-5">
              <TacticalInput
                label="Full Name"
                icon={User}
                value={formData.name}
                onChange={(v) => setFormData({ ...formData, name: v })}
                required
              />
              <TacticalInput
                label="Military Email"
                icon={Mail}
                type="email"
                value={formData.email}
                onChange={(v) => setFormData({ ...formData, email: v })}
                required
              />
              <TacticalInput
                label="Authorization Key"
                icon={Lock}
                type="password"
                value={formData.password}
                onChange={(v) => setFormData({ ...formData, password: v })}
                required
              />
              <TacticalInput
                label="Assigned Sector"
                icon={Globe}
                placeholder="e.g. Faisalabad Base"
                value={formData.region}
                onChange={(v) => setFormData({ ...formData, region: v })}
                required
              />

              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all transform active:scale-95 shadow-lg shadow-blue-900/20 mt-4">
                Initialize Account
              </button>
            </form>
          </div>

          {/* Commander Directory */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black flex items-center gap-3 text-blue-500 uppercase tracking-[0.2em]">
                <List size={18} /> Sector Command Directory
              </h3>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                Total Officers: {commanders.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commanders.map((c) => (
                <CommanderNode key={c._id} commander={c} />
              ))}
            </div>

            {commanders.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">
                  No Active Commanders Assigned
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
