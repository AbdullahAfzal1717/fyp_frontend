import { useState } from "react";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { ModernInput } from "../../components/ui/Input";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();
    // Logic for password reset request
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to login
        </Link>

        {!submitted ? (
          <>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              Reset Password
            </h3>
            <p className="text-gray-500 mb-8">
              Enter the email associated with your account and we'll send a
              recovery link.
            </p>

            <form onSubmit={handleReset} className="space-y-6">
              <ModernInput
                label="Registered Email"
                type="email"
                placeholder="dr.reed@commandx.health"
                value={email}
                onChange={setEmail}
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-100"
              >
                Send Recovery Link
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Check your email
            </h3>
            <p className="text-gray-500 mb-8">
              We have sent password recovery instructions to <br />
              <span className="font-semibold text-gray-800">{email}</span>
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-blue-600 font-bold hover:underline text-sm"
            >
              Didn't receive the email? Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
