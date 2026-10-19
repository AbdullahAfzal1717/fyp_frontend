import { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();

  const finishSupervisorLogin = (payload) => {
    if (payload?.userData?.role !== "SUPERVISOR") {
      throw new Error(
        "This web dashboard is only for supervisor accounts. Use the mobile app as a patient, or sign up as a supervisor.",
      );
    }
    login(payload);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      finishSupervisorLogin(res.data);
    } catch (err) {
      setError(getErrorMessage(err, err.message || "Authorization failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError(null);
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) throw new Error("Google did not return a credential");

      const res = await api.post("/auth/google", {
        idToken,
        preferredRole: "SUPERVISOR",
      });
      finishSupervisorLogin(res.data);
    } catch (err) {
      setError(getErrorMessage(err, err.message || "Google sign-in failed"));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* LEFT: brand panel — stacks on top on mobile */}
      <div className="relative overflow-hidden w-full lg:w-[55%] min-h-55 lg:min-h-screen bg-blue-600 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 text-white">
        <div className="absolute top-[-10%] left-[-10%] w-105 h-105 bg-blue-500 rounded-full opacity-50 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-90 h-90 bg-blue-400 rounded-full opacity-30 blur-3xl" />

        <div className="z-10 w-full max-w-xl text-center">
          <div className="flex items-center justify-center gap-3 mb-6 lg:mb-10">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl sm:text-2xl font-bold leading-none">VitalSync</h1>
              <p className="text-[10px] uppercase tracking-widest opacity-80">
                Command dashboard
              </p>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6 leading-tight">
            Monitor. Protect.
            <br className="hidden sm:block" />
            Lead with clarity.
          </h2>
          <p className="text-blue-100 mb-6 lg:mb-10 max-w-md mx-auto text-sm sm:text-base lg:text-lg">
            Real-time vitals, context-aware risk scores, and alerts for field
            supervisors.
          </p>

          <div className="hidden md:block space-y-3 mb-8">
            {[
              {
                icon: Wifi,
                title: "Live monitoring",
                desc: "Socket updates as vitals arrive",
              },
              {
                icon: Shield,
                title: "Context-aware risk",
                desc: "STATIC vs RUNNING thresholds",
              },
              {
                icon: Globe,
                title: "Web + mobile + wearable",
                desc: "One backend for the whole stack",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-left"
              >
                <div className="bg-blue-500 p-2 rounded-lg shrink-0">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                  <p className="text-xs text-blue-100">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: form */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 relative bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-5">
            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Supervisor access
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h3>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">
            Sign in to your VitalSync command dashboard
          </p>

          <div className="mb-5 flex justify-center min-h-11">
            {googleLoading ? (
              <p className="text-sm text-blue-600 font-medium py-2">
                Completing Google sign-in…
              </p>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-in failed. Try again.")}
                theme="outline"
                size="large"
                shape="pill"
                text="continue_with"
                width="320"
              />
            )}
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              or email
            </span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <ModernInput
              label="Email Address"
              type="email"
              placeholder="supervisor@example.com"
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
                className="absolute right-3 top-9.5 text-gray-400 hover:text-gray-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3.5 sm:py-4 rounded-xl transition-all shadow-lg shadow-blue-200/60 disabled:opacity-70 active:scale-[0.98]"
            >
              {loading ? "Signing in…" : "Sign In to Dashboard"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            Need a supervisor account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 font-bold hover:underline"
            >
              Create Account
            </Link>
          </p>

          <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-500 shrink-0" />
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Demo tip: use <span className="font-semibold">ahmed@test.com</span>{" "}
              / <span className="font-semibold">123456</span> after seeding, or
              continue with Google (creates a supervisor account on first use).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
