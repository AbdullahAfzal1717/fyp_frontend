import { useState } from "react";
import { Link } from "react-router-dom"; // Added Link import
import api, { getErrorMessage } from "../../services/api";
import { useAuth } from "../../context/useAuth";
import {
  Activity,
  Wifi,
  Shield,
  Globe,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { ModernInput } from "../../components/ui/Input";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data?.userData?.role !== "SUPERVISOR") {
        throw new Error("This web dashboard is only for supervisor accounts.");
      }
      login(res.data);
    } catch (err) {
      setError(getErrorMessage(err, err.message || "Authorization failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* LEFT SIDE: HERO SECTION */}
      <div className="relative overflow-hidden w-full lg:w-[60%] bg-blue-600 flex flex-col items-center justify-center p-8 lg:p-12 text-white">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500 rounded-full opacity-50 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-400 rounded-full opacity-30 blur-3xl" />
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-blue-700 rounded-full opacity-20 -translate-x-1/2" />

        <div className="z-10 w-full max-w-xl text-center">
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold leading-none">Command-X</h1>
              <p className="text-[10px] uppercase tracking-widest opacity-80">
                Intelligent Health Surveillance
              </p>
            </div>
          </div>

          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Monitor. Protect.
            <br />
            Save Lives.
          </h2>
          <p className="text-blue-100 mb-12 max-w-md mx-auto text-lg">
            AI-powered real-time health surveillance platform for medical
            supervisors.
          </p>

          <div className="space-y-4 mb-12">
            {[
              {
                icon: Wifi,
                title: "Real-time Monitoring",
                desc: "Live vitals refreshed every 3 seconds",
              },
              {
                icon: Shield,
                title: "AI-Powered Risk Engine",
                desc: "Intelligent anomaly detection & scoring",
              },
              {
                icon: Globe,
                title: "Cross Platform",
                desc: "Web, mobile & wearable device support",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-left"
              >
                <div className="bg-blue-500 p-2 rounded-lg">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                  <p className="text-xs text-blue-100">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-8">
            <div>
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-[10px] uppercase opacity-70">Uptime SLA</div>
            </div>
            <div>
              <div className="text-2xl font-bold">&lt;3s</div>
              <div className="text-[10px] uppercase opacity-70">
                Alert Latency
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">HIPAA</div>
              <div className="text-[10px] uppercase opacity-70">Compliant</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM */}
      <div className="w-full lg:w-[40%] flex flex-col items-center justify-center p-8 lg:p-16 relative bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Supervisor Access Only
            </span>
          </div>

          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, Doctor
          </h3>
          <p className="text-gray-500 mb-8">
            Sign in to your Command-X dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <ModernInput
              label="Email Address"
              type="email"
              placeholder="dr.reed@commandx.health"
              value={email}
              onChange={setEmail}
              required
            />

            <div className="relative">
              <ModernInput
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:underline hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-70 active:scale-[0.98]"
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
            </button>
          </form>

          {/* New Signup Link Section */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have a supervisor account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 font-bold hover:underline transition-colors"
            >
              Create Account
            </Link>
          </p>

          <div className="mt-12 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4">
            <ShieldCheck className="w-10 h-10 text-blue-500 shrink-0" />
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Protected by enterprise-grade TLS encryption. All patient data is
              fully HIPAA compliant and audit-logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
