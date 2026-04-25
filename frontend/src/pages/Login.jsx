import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, KeyRound, Mail, ArrowRight, Loader2, MonitorSmartphone, ShieldCheck, Activity, Users } from "lucide-react";
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
      await api.post("/auth/request-otp", { email });
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
      const response = await api.post("/auth/verify-otp", { email, otpCode });
      localStorage.setItem("token", response.data.token);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: ShieldCheck, label: "Passwordless Auth", value: "OTP-based" },
    { icon: Activity, label: "Uptime", value: "99.9%" },
    { icon: Users, label: "For IITP Institue Use Only", value: "" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        @keyframes page-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes card-in {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes left-in {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); }
          70%  { box-shadow: 0 0 0 10px rgba(37,99,235,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
        }
        @keyframes step-slide-in {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes grid-pan {
          from { background-position: 0 0; }
          to   { background-position: 40px 40px; }
        }
        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -20px) scale(1.05); }
          66%       { transform: translate(-20px, 15px) scale(0.97); }
        }

        .page-animate  { animation: page-in   0.4s ease both; }
        .card-animate  { animation: card-in   0.55s cubic-bezier(.16,1,.3,1) 0.05s both; }
        .left-animate  { animation: left-in   0.55s cubic-bezier(.16,1,.3,1) 0.1s  both; }
        .step-animate  { animation: step-slide-in 0.3s cubic-bezier(.16,1,.3,1) both; }
        .float-anim    { animation: float 5s ease-in-out infinite; }
        .orb-drift     { animation: orb-drift 12s ease-in-out infinite; }

        .logo-shimmer {
          background: linear-gradient(90deg, #60a5fa 0%, #a5b4fc 40%, #60a5fa 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .grid-bg {
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: grid-pan 8s linear infinite;
        }

        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          color: #e4e4e7;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }
        .input-field::placeholder { color: #52525b; }
        .input-field:focus {
          background: rgba(255,255,255,0.07);
          border-color: rgba(37,99,235,0.6);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
        }

        .btn-primary {
          display: flex; align-items: center; justify-content: center;
          width: 100%;
          background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
          color: #fff;
          font-size: 14px; font-weight: 600;
          border: none; border-radius: 14px;
          padding: 14px 24px;
          cursor: pointer;
          position: relative; overflow: hidden;
          transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
          box-shadow: 0 4px 20px rgba(79,70,229,0.35);
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(79,70,229,0.5);
          filter: brightness(1.08);
        }
        .btn-primary:active:not(:disabled) {
          transform: translateY(0px) scale(0.98);
          box-shadow: 0 2px 12px rgba(79,70,229,0.3);
        }
        .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
        .btn-primary::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }
        .btn-primary:hover:not(:disabled)::after { transform: translateX(100%); }

        .otp-input {
          letter-spacing: 0.6em;
          font-size: 26px;
          font-family: 'JetBrains Mono', monospace;
          text-align: center;
          padding: 18px 24px;
        }

        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .stat-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
        }

        .divider-text {
          position: relative; text-align: center;
        }
        .divider-text::before, .divider-text::after {
          content: ''; position: absolute; top: 50%;
          width: 45%; height: 1px;
          background: rgba(255,255,255,0.06);
        }
        .divider-text::before { left: 0; }
        .divider-text::after  { right: 0; }
      `}</style>

      <div
        className="page-animate min-h-screen flex"
        style={{ background: "#0c0c10" }}
      >
        {/* ─── LEFT PANEL (Hero) ─────────────────────────────────── */}
        <div
          className="left-animate hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12"
          style={{
            background: "linear-gradient(135deg, #0f0f14 0%, #111116 100%)",
            borderRight: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Animated grid bg */}
          <div className="grid-bg absolute inset-0 opacity-60" />

          {/* Glowing orbs */}
          <div
            className="orb-drift absolute rounded-full"
            style={{
              width: "400px", height: "400px",
              top: "10%", left: "-15%",
              background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="orb-drift absolute rounded-full"
            style={{
              width: "300px", height: "300px",
              bottom: "15%", right: "-10%",
              background: "radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)",
              filter: "blur(40px)",
              animationDelay: "4s",
            }}
          />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                boxShadow: "0 0 20px rgba(79,70,229,0.4)",
              }}
            >
              <MonitorSmartphone style={{ height: "18px", width: "18px", color: "#fff" }} />
            </div>
            <div>
              <span className="text-lg font-bold logo-shimmer">IMS Portal</span>
              <p className="text-xs" style={{ color: "#3f3f46", marginTop: "-2px" }}>
                Asset Management
              </p>
            </div>
          </div>

          {/* Central hero content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-8">
            {/* Icon */}
            <div
              className="float-anim h-20 w-20 rounded-2xl flex items-center justify-center mb-8"
              style={{
                background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(79,70,229,0.1))",
                border: "1px solid rgba(79,70,229,0.3)",
                boxShadow: "0 0 40px rgba(79,70,229,0.2)",
              }}
            >
              <ShieldCheck style={{ height: "36px", width: "36px", color: "#60a5fa" }} />
            </div>

            <h1
              className="text-3xl font-bold mb-3 leading-tight"
              style={{ color: "#f4f4f5" }}
            >
              Secure Asset
              <br />
              <span className="logo-shimmer">Management</span>
            </h1>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#71717a" }}>
              IITP institute inventory tracking with passwordless authentication and real-time audit logs.
            </p>

            {/* Stats */}
            <div className="w-full mt-10 space-y-3 max-w-xs">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="stat-card">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(37,99,235,0.15)" }}
                  >
                    <Icon style={{ height: "15px", width: "15px", color: "#60a5fa" }} />
                  </div>
                  <div className="flex-1 text-left flex flex-col justify-center">
                    {value ? (
                      <>
                        <p className="text-xs" style={{ color: "#52525b" }}>{label}</p>
                        <p className="text-sm font-semibold" style={{ color: "#d4d4d8" }}>{value}</p>
                      </>
                    ) : (
                      <p className="text-sm font-semibold" style={{ color: "#d4d4d8" }}>{label}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom tagline */}
          <p className="relative z-10 text-xs text-center" style={{ color: "#3f3f46" }}>
            © 2026 IMS Portal · IITP institute Edition
          </p>
        </div>

        {/* ─── RIGHT PANEL (Form) ────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div
            className="card-animate w-full max-w-sm"
            style={{
              background: "rgba(20,20,24,0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "24px",
              padding: "36px 32px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Card header */}
            <div className="text-center mb-8">
              <div
                className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: step === 1
                    ? "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)"
                    : "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
                  boxShadow: step === 1
                    ? "0 0 24px rgba(79,70,229,0.4)"
                    : "0 0 24px rgba(5,150,105,0.4)",
                  transition: "background 0.4s ease, box-shadow 0.4s ease",
                }}
              >
                {step === 1
                  ? <LogIn style={{ height: "22px", width: "22px", color: "#fff" }} strokeWidth={2.5} />
                  : <KeyRound style={{ height: "22px", width: "22px", color: "#fff" }} strokeWidth={2.5} />
                }
              </div>

              <h2 className="text-xl font-bold mb-1.5" style={{ color: "#f4f4f5" }}>
                {step === 1 ? "Welcome back" : "Check your inbox"}
              </h2>
              <p className="text-sm" style={{ color: "#71717a" }}>
                {step === 1
                  ? "Sign in to your admin account"
                  : <>Code sent to <span style={{ color: "#a1a1aa", fontWeight: 500 }}>{email}</span></>
                }
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-7">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  style={{
                    flex: 1, height: "3px", borderRadius: "9999px",
                    background: step >= s
                      ? "linear-gradient(90deg, #2563eb, #4f46e5)"
                      : "rgba(255,255,255,0.08)",
                    transition: "background 0.4s ease",
                    boxShadow: step >= s ? "0 0 8px rgba(79,70,229,0.5)" : "none",
                  }}
                />
              ))}
            </div>

            {/* ── STEP 1: Email ── */}
            {step === 1 && (
              <form className="step-animate space-y-4" onSubmit={handleRequestOtp}>
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "#a1a1aa" }}
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <div
                      className="absolute inset-y-0 left-0 flex items-center pointer-events-none"
                      style={{ paddingLeft: "14px" }}
                    >
                      <Mail style={{ height: "16px", width: "16px", color: "#52525b" }} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: "42px", paddingRight: "16px", paddingTop: "13px", paddingBottom: "13px" }}
                      placeholder="admin@company.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ marginTop: "8px" }}
                >
                  {loading
                    ? <Loader2 style={{ height: "18px", width: "18px", animation: "spin 1s linear infinite" }} />
                    : <>
                      <span>Send Security Code</span>
                      <ArrowRight style={{ height: "15px", width: "15px", marginLeft: "8px" }} />
                    </>
                  }
                </button>
              </form>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 2 && (
              <form className="step-animate space-y-4" onSubmit={handleVerifyOtp}>
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "#a1a1aa" }}
                  >
                    6-digit security code
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="input-field otp-input"
                    placeholder="••••••"
                    required
                  />
                  {/* Progress dots */}
                  <div className="flex justify-center gap-2 mt-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          height: "4px", width: "28px", borderRadius: "9999px",
                          background: i < otpCode.length
                            ? "linear-gradient(90deg, #2563eb, #4f46e5)"
                            : "rgba(255,255,255,0.08)",
                          transition: "background 0.2s ease",
                          boxShadow: i < otpCode.length ? "0 0 6px rgba(79,70,229,0.5)" : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="btn-primary"
                  style={{ marginTop: "8px" }}
                >
                  {loading
                    ? <Loader2 style={{ height: "18px", width: "18px", animation: "spin 1s linear infinite" }} />
                    : <>
                      <span>Verify &amp; Sign In</span>
                      <ArrowRight style={{ height: "15px", width: "15px", marginLeft: "8px" }} />
                    </>
                  }
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm font-medium text-center pt-1"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#52525b", transition: "color 0.18s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#a1a1aa")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
                >
                  ← Use a different email
                </button>
              </form>
            )}

            {/* Divider + Register */}
            <div className="mt-7 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs text-center" style={{ color: "#52525b" }}>
                Need system access?{" "}
                <button
                  onClick={() => navigate("/register")}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#60a5fa", fontWeight: 500, fontSize: "12px",
                    transition: "color 0.18s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#60a5fa")}
                >
                  Request an account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;