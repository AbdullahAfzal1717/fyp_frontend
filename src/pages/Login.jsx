import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Lock, User, ShieldCheck, Terminal, AlertCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      console.log(res);
      // Passing the token to your context login function as per your code
      login(res.data);
    } catch (err) {
      setError("Invalid Email or Password. Access Denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glow Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md z-10">
        {/* Tactical Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 text-emerald-500 mb-4 shadow-2xl">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-[0.2em] uppercase italic">
            SOLDIER
            <span className="text-emerald-500 text-shadow-glow">SYNC</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-mono mt-2 uppercase tracking-[0.3em]">
            Secure Military Surveillance Portal
          </p>
        </div>

        {/* Access Terminal Card */}
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl">
          <form onSubmit={submit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-shake">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Personnel Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-emerald-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-mono text-sm"
                  placeholder="name@army.mil"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Authorization Key
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-mono text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all transform active:scale-[0.98] overflow-hidden"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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

          <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-between items-center text-[9px] font-mono text-slate-600 uppercase tracking-tighter">
            <span>Terminal: #NUML-FSD</span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Node Link Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
