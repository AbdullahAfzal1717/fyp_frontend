import { useState } from "react";
import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import { ModernInput } from "../../components/ui/Input";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const Signup = () => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signup(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* LEFT SIDE: BRANDING */}
      <div className="relative overflow-hidden w-full lg:w-[60%] bg-blue-600 flex flex-col items-center justify-center p-8 lg:p-12 text-white">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500 rounded-full opacity-50 blur-3xl" />
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
            Join the Network.
          </h2>
          <p className="text-blue-100 text-lg">
            Initialize your Supervisor profile to manage medical personnel and
            real-time alerts.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="w-full lg:w-[40%] flex flex-col items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h3>
          <p className="text-gray-500 mb-8">Sign up as a Medical Supervisor</p>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex gap-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            <ModernInput
              label="Full Name"
              placeholder="Abdullah Afzal"
              value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })}
              required
            />
            <ModernInput
              label="Email Address"
              type="email"
              placeholder="abdullah@nu.edu.pk"
              value={formData.email}
              onChange={(v) => setFormData({ ...formData, email: v })}
              required
            />
            <ModernInput
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(v) => setFormData({ ...formData, password: v })}
              required
            />

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-100 mt-4 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Create Supervisor Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-bold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
