import { useState } from "react";
import api from "../services/api";
import {
  UserPlus,
  Save,
  Activity,
  HeartPulse,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { TacticalInput } from "../components/ui/Input";

const RegisterSoldier = () => {
  const RANKS = [
    "Private",
    "Corporal",
    "Sergeant",
    "Lieutenant",
    "Captain",
    "Major",
    "Colonel",
  ];

  const [formData, setFormData] = useState({
    soldierId: "",
    name: "",
    rank: "Private",
    unit: "",
    bloodGroup: "",
    role: "SOLDIER",
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/soldiers/register", formData);
      setIsSuccess(true);
      // Reset form after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          soldierId: "",
          name: "",
          rank: "Private",
          unit: "",
          bloodGroup: "",
          role: "SOLDIER",
        });
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Success Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <CheckCircle2
              size={64}
              className="text-emerald-500 mb-4 animate-bounce"
            />
            <h2 className="text-2xl font-black text-white uppercase italic">
              Personnel Enlisted
            </h2>
            <p className="text-slate-500 font-mono text-sm mt-2">
              Node Syncing with GHQ...
            </p>
          </div>
        )}

        <header className="flex items-center gap-4 mb-10 border-b border-slate-800 pb-8">
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20">
            <UserPlus size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
              Enrollment Portal
            </h1>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-1 text-emerald-500/80">
              Biometric Hardware Integration :: ACTIVE
            </p>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
        >
          <TacticalInput
            label="LoRa Hardware ID"
            icon={Activity}
            placeholder="FC-XXX"
            value={formData.soldierId}
            onChange={(v) => setFormData({ ...formData, soldierId: v })}
            required
          />
          <TacticalInput
            label="Full Name"
            icon={UserPlus}
            placeholder="Personnel Name"
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
            required
          />
          {/* Custom Select for Rank */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Military Rank
            </label>
            <div className="relative group">
              <select
                value={formData.rank}
                onChange={(e) =>
                  setFormData({ ...formData, rank: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none appearance-none focus:border-emerald-500/50 transition-all font-mono text-sm"
              >
                {RANKS.map((r) => (
                  <option key={r} value={r}>
                    {r.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-emerald-500"
                size={16}
              />
            </div>
          </div>
          <TacticalInput
            label="Assigned Unit"
            icon={Activity}
            placeholder="e.g., Alpha Squad"
            value={formData.unit}
            onChange={(v) => setFormData({ ...formData, unit: v })}
            required
          />
          <TacticalInput
            label="Blood Group"
            icon={HeartPulse}
            placeholder="O+ / B-"
            value={formData.bloodGroup}
            onChange={(v) => setFormData({ ...formData, bloodGroup: v })}
            required
          />
          <div className="hidden md:block" /> {/* Grid Spacer */}
          {/* Role Selection Toggle */}
          <div className="md:col-span-2 space-y-3 pt-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Combat Designation
            </label>
            <div className="grid grid-cols-2 gap-4">
              <RoleButton
                active={formData.role === "SOLDIER"}
                onClick={() => setFormData({ ...formData, role: "SOLDIER" })}
                label="Combatant"
                icon={<Activity size={18} />}
                color="emerald"
              />
              <RoleButton
                active={formData.role === "MEDIC"}
                onClick={() => setFormData({ ...formData, role: "MEDIC" })}
                label="Unit Medic"
                icon={<HeartPulse size={18} />}
                color="red"
              />
            </div>
          </div>
          <button className="md:col-span-2 group flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white p-5 rounded-2xl font-black tracking-[0.3em] transition-all transform active:scale-[0.97] mt-6 shadow-xl shadow-emerald-900/40">
            <Save
              size={20}
              className="group-hover:rotate-12 transition-transform"
            />
            INITIALIZE ENROLLMENT
          </button>
        </form>
      </div>
    </div>
  );
};

// Internal Helper for the Role Toggle Buttons
const RoleButton = ({ active, onClick, label, icon, color }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-4 rounded-2xl border flex items-center justify-center gap-2 font-bold transition-all uppercase text-[11px] tracking-widest ${
      active
        ? color === "emerald"
          ? "bg-emerald-600 border-emerald-500 text-white"
          : "bg-red-600 border-red-500 text-white"
        : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
    }`}
  >
    {icon} {label}
  </button>
);

export default RegisterSoldier;
