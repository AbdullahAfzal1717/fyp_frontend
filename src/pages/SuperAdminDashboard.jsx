import { useState, useEffect } from "react";
import api from "../services/api";
import { ShieldAlert, UserPlus, MapPin, List } from "lucide-react";

const SuperAdminDashboard = () => {
  const [commanders, setCommanders] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    region: "",
  });

  const fetchCommanders = async () => {
    const res = await api.get("/admin/commanders");
    setCommanders(res.data);
  };

  useEffect(() => {
    fetchCommanders();
  }, []);

  const handleCreateCommander = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/create-commander", formData);
      alert("COMMANDER ACCOUNT ACTIVATED");
      setFormData({ name: "", email: "", password: "", region: "" });
      fetchCommanders();
    } catch (err) {
      alert("Registration Failed: Clearance Issue");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-slate-800 pb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              GHQ Command Center
            </h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-2">
              Strategic Personnel Management
            </p>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-500 flex items-center gap-3">
            <ShieldAlert size={24} />{" "}
            <span className="font-bold text-xs uppercase">
              Level 5 Access Granted
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form: Create Commander */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] h-fit">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-emerald-500">
              <UserPlus size={20} /> Appoint New Commander
            </h3>
            <form onSubmit={handleCreateCommander} className="space-y-4">
              <AdminInput
                label="Full Name"
                value={formData.name}
                onChange={(v) => setFormData({ ...formData, name: v })}
              />
              <AdminInput
                label="Email"
                value={formData.email}
                onChange={(v) => setFormData({ ...formData, email: v })}
              />
              <AdminInput
                label="Temporary Password"
                value={formData.password}
                onChange={(v) => setFormData({ ...formData, password: v })}
              />
              <AdminInput
                label="Assigned Sector"
                placeholder="Faisalabad / Sialkot"
                value={formData.region}
                onChange={(v) => setFormData({ ...formData, region: v })}
              />
              <button className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all mt-4">
                ACTIVATE ACCOUNT
              </button>
            </form>
          </div>

          {/* List: Active Commanders */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[2rem]">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-blue-500">
              <List size={20} /> Active Sector Commanders
            </h3>
            <div className="space-y-4">
              {commanders.map((c) => (
                <div
                  key={c._id}
                  className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-bold text-white uppercase">{c.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">
                      {c.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 font-mono text-[10px] bg-emerald-500/5 px-3 py-1 rounded-lg border border-emerald-500/10">
                    <MapPin size={12} /> {c.region}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminInput = ({ label, value, onChange, placeholder = "" }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">
      {label}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-blue-500/50 transition-all text-sm"
    />
  </div>
);

export default SuperAdminDashboard;
