import React, { useEffect, useState, useCallback } from "react";
import {
  Camera,
  Copy,
  Share2,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react";
import api, { getErrorMessage } from "../../services/api";

// --- Reusable UI Components ---

const FormInput = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
    />
  </div>
);

const ToggleRow = ({ icon: Icon, title, desc, active, onToggle }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex gap-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"}`}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-700">{title}</p>
        <p className="text-[11px] text-slate-400 font-medium">{desc}</p>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full transition-colors relative ${active ? "bg-blue-600" : "bg-slate-200"}`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? "left-6" : "left-1"}`}
      />
    </button>
  </div>
);

// --- Main Profile Component ---

const Profile = () => {
  const [form, setForm] = useState({
    name: "",
    email: "", // Added for UI completeness
    specialty: "Cardiology & Remote Monitoring", // Default/Static as per image
    phone: "",
    age: "",
  });

  const [preferences, setPreferences] = useState({
    critical: true,
    caution: true,
    requests: true,
    summary: false,
    email: true,
    sms: false,
    push: true,
  });

  const [supervisorCode, setSupervisorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileRes, codeRes] = await Promise.all([
          api.get("/users/profile"),
          api.get("/users/supervisor-code"),
        ]);

        const data = profileRes.data;
        setForm({
          name: data?.name || "",
          email: data?.email || "",
          phone: data?.phone || "",
          age: data?.age || "",
          specialty: data?.specialty || "General Supervisor",
        });
        setSupervisorCode(codeRes.data?.supervisorCode || "000000");
      } catch (err) {
        setError(getErrorMessage(err, "Failed to fetch profile"));
      }
    };
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setError("");

    try {
      await api.patch("/users/profile", {
        ...form,
        age: form.age === "" ? undefined : Number(form.age),
      });
      setStatus("Changes saved successfully");
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(supervisorCode);
    alert("Code copied to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <header>
        <h1 className="text-2xl font-black text-slate-800">
          Profile & Settings
        </h1>
        <p className="text-slate-400 text-sm font-medium">
          Tuesday, May 6, 2026 • St. Mary Medical Center
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Profile Info */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">
              Profile Information
            </h3>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100">
                  {form.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("") || "AR"}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white border border-slate-100 rounded-full shadow-lg text-slate-600 hover:text-blue-600 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <FormInput
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <FormInput
                label="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <FormInput
                label="Specialty"
                value={form.specialty}
                onChange={(e) =>
                  setForm({ ...form, specialty: e.target.value })
                }
              />
              <FormInput
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </form>
          </section>

          {/* Supervisor Code Card */}
          <section className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 size={18} className="text-blue-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Supervisor Code
              </h3>
            </div>

            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
              Share this code with your patients so they can connect their
              monitoring devices to your dashboard.
            </p>

            <div className="bg-slate-50 rounded-2xl p-6 border border-dashed border-blue-200 text-center space-y-4">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                Your Access Code
              </p>
              <div className="flex justify-center gap-3">
                {supervisorCode.split("").map((char, i) => (
                  <span key={i} className="text-3xl font-black text-slate-800">
                    {char}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                6-digit supervisor identifier
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={copyCode}
                className="flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                <Copy size={14} /> Copy Code
              </button>
              <button className="flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Share2 size={14} /> Share
              </button>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Preferences */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <Bell size={18} className="text-blue-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Alert Preferences
              </h3>
            </div>

            <div className="divide-y divide-slate-50">
              <ToggleRow
                icon={AlertCircle}
                title="Critical Alerts"
                desc="Immediately for life-threatening vitals"
                active={preferences.critical}
                onToggle={() =>
                  setPreferences({
                    ...preferences,
                    critical: !preferences.critical,
                  })
                }
              />
              <ToggleRow
                icon={Bell}
                title="Caution Alerts"
                desc="Warning-level vital deviations"
                active={preferences.caution}
                onToggle={() =>
                  setPreferences({
                    ...preferences,
                    caution: !preferences.caution,
                  })
                }
              />
              <ToggleRow
                icon={Users}
                title="New Patient Requests"
                desc="When a patient requests to connect"
                active={preferences.requests}
                onToggle={() =>
                  setPreferences({
                    ...preferences,
                    requests: !preferences.requests,
                  })
                }
              />
              <ToggleRow
                icon={FileText}
                title="Daily Summary Report"
                desc="Morning digest of all patients"
                active={preferences.summary}
                onToggle={() =>
                  setPreferences({
                    ...preferences,
                    summary: !preferences.summary,
                  })
                }
              />
            </div>
          </section>

          <section className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">
              Delivery Methods
            </h3>

            <div className="divide-y divide-slate-50">
              <ToggleRow
                icon={Mail}
                title="Email Notifications"
                desc={form.email || "Primary email address"}
                active={preferences.email}
                onToggle={() =>
                  setPreferences({ ...preferences, email: !preferences.email })
                }
              />
              <ToggleRow
                icon={Smartphone}
                title="SMS / Text Alerts"
                desc={form.phone || "No phone linked"}
                active={preferences.sms}
                onToggle={() =>
                  setPreferences({ ...preferences, sms: !preferences.sms })
                }
              />
              <ToggleRow
                icon={Bell}
                title="In-App Push Alerts"
                desc="Browser & desktop notifications"
                active={preferences.push}
                onToggle={() =>
                  setPreferences({ ...preferences, push: !preferences.push })
                }
              />
            </div>

            <div className="mt-10">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-blue-100 disabled:opacity-50"
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={20} /> Save Changes
                  </>
                )}
              </button>

              {status && (
                <p className="mt-4 text-center text-emerald-500 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in zoom-in">
                  <CheckCircle2 size={14} /> {status}
                </p>
              )}
              {error && (
                <p className="mt-4 text-center text-red-500 text-xs font-bold flex items-center justify-center gap-2">
                  <AlertCircle size={14} /> {error}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Internal Mock Icon for FileText since it wasn't imported in this scope but used in ToggleRow
const FileText = ({ size }) => (
  <div
    style={{ width: size, height: size }}
    className="border-2 border-current rounded-sm relative after:absolute after:top-1 after:left-1 after:w-2 after:h-0.5 after:bg-current"
  />
);

export default Profile;
