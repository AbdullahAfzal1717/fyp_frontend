import { useState } from "react";
import api from "../services/api";
import {
  UserPlus,
  Save,
  Activity,
  HeartPulse,
  ChevronDown,
} from "lucide-react";

const RegisterSoldier = () => {
  // Common military ranks for the dropdown
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
    rank: "Private", // Default to lowest rank
    unit: "", // Added Unit field
    bloodGroup: "",
    role: "SOLDIER",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/soldiers/register", formData);
      alert("PERSONNEL ENLISTED SUCCESSFULLY");
      setFormData({
        soldierId: "",
        name: "",
        rank: "Private",
        unit: "",
        bloodGroup: "",
        role: "SOLDIER",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
        <header className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20">
            <UserPlus size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
              Enrollment Portal
            </h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
              Add biometric node to unit
            </p>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <InputGroup
            label="LoRa Hardware ID"
            placeholder="FC-XXX"
            value={formData.soldierId}
            onChange={(v) => setFormData({ ...formData, soldierId: v })}
          />
          <InputGroup
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
          />

          {/* Professional Rank Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
              Military Rank
            </label>
            <div className="relative">
              <select
                value={formData.rank}
                onChange={(e) =>
                  setFormData({ ...formData, rank: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white outline-none appearance-none focus:border-emerald-500/50 transition-all font-mono"
              >
                {RANKS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                size={16}
              />
            </div>
          </div>

          <InputGroup
            label="Assigned Unit"
            placeholder="Infantry / Special Ops"
            value={formData.unit}
            onChange={(v) => setFormData({ ...formData, unit: v })}
          />

          <InputGroup
            label="Blood Group"
            placeholder="O+ / AB-"
            value={formData.bloodGroup}
            onChange={(v) => setFormData({ ...formData, bloodGroup: v })}
          />

          <div className="md:col-span-1 flex flex-col gap-3">
            {/* Empty space for grid alignment or add another field here */}
          </div>

          {/* Role Selection */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
              Designation
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "SOLDIER" })}
                className={`p-4 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                  formData.role === "SOLDIER"
                    ? "bg-emerald-600 border-emerald-500 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                }`}
              >
                <Activity size={18} /> COMBATANT
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "MEDIC" })}
                className={`p-4 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                  formData.role === "MEDIC"
                    ? "bg-red-600 border-red-500 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                }`}
              >
                <HeartPulse size={18} /> UNIT MEDIC
              </button>
            </div>
          </div>

          <button className="md:col-span-2 group flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white p-5 rounded-2xl font-black tracking-[0.3em] transition-all transform active:scale-95 shadow-xl shadow-emerald-900/20">
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

const InputGroup = ({ label, placeholder, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
      {label}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required
      className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-white outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all font-mono"
    />
  </div>
);

export default RegisterSoldier;
