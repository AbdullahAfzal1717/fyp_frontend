import { useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Lock, User, ShieldCheck, Terminal, AlertCircle } from "lucide-react";
import { TacticalInput } from "../../components/ui/Input";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data); // res.data should contain your token
    } catch (err) {
      setError("Authorization Failed: Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Visual Depth Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 text-emerald-500 mb-4 shadow-2xl shadow-emerald-500/10">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-[0.2em] uppercase italic">
            SOLDIER<span className="text-emerald-500">SYNC</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-mono mt-2 uppercase tracking-[0.3em]">
            Secure Military Surveillance Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-pulse">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <TacticalInput
              label="Personnel Email"
              icon={User}
              type="email"
              placeholder="name@army.mil"
              onChange={setEmail}
              required
            />

            <TacticalInput
              label="Authorization Key"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              onChange={setPassword}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Terminal
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  INITIALIZE UPLINK
                </>
              )}
            </button>
          </form>

          {/* Terminal Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-between items-center text-[9px] font-mono text-slate-600 uppercase tracking-tighter">
            <span>Terminal: #NUML-FSD</span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Uplink Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
