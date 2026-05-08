import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, KeyRound, Mail, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    try {
      await api.post("/auth/request-otp", { email, loginType: "admin" });
      toast.success("Security code sent!");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return toast.error("Code must be 6 digits");

    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", { email, otpCode, loginType: "admin" });
      localStorage.setItem("token", response.data.token);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // The soft, sky-like gradient background
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-white">
      {/* The Frosted Glass Card */}
      <div className="max-w-xl w-full bg-white/60 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-14 border border-white/80 transition-all duration-500">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="mx-auto h-32 w-32 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-gray-100 overflow-hidden">
            <img
              src="/iitp-logo.png"
              alt="IITP"
              className="h-28 w-28 object-contain"
            />
          </div>
          <h2 className="text-4xl font-bold text-gray-900">
            {step === 1
              ? "IIT Patna Computer Centre Inventory"
              : "Enter Security Code"}
          </h2>
        </div>

        {/* Dynamic Form */}
        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
                  placeholder="Email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-medium text-white bg-[#1C1C1E] hover:bg-black shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-8"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Get Started"
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              Are you a user?{" "}
              <button
                type="button"
                onClick={() => navigate("/login-user")}
                className="text-blue-600 hover:underline font-medium"
              >
                Login here
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <input
                type="text"
                maxLength="6"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="block w-full text-center text-2xl tracking-[0.75em] py-4 bg-gray-50/50 border border-gray-200/80 rounded-xl text-gray-900 placeholder-gray-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                placeholder="••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-medium text-white bg-[#1C1C1E] hover:bg-black shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-8"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Verify & Login</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray-500 hover:text-gray-900 font-medium text-center transition-colors pt-2"
            >
              Use a different email
            </button>
          </form>
        )}
        {/* Add this right below your form blocks in Login.jsx */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Need system access?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Request an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
