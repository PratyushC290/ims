import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  UserPlus, Mail, User, Phone, Loader2,
  MonitorSmartphone, ShieldCheck, Clock, BadgeCheck,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    instituteEmail: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/signup", formData);
      toast.success(response.data.message, { duration: 5000 });
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    {
      icon: ShieldCheck,
      title: "Role-based Access",
      desc: "Permissions scoped to your admin level.",
    },
    {
      icon: Clock,
      title: "Quick Approval",
      desc: "Requests reviewed within one business day.",
    },
    {
      icon: BadgeCheck,
      title: "Verified Identity",
      desc: "Institute email ensures secure onboarding.",
    },
  ];

  const fields = [
    {
      key: "fullname",
      type: "text",
      placeholder: "Full Legal Name",
      icon: User,
      label: "Full name",
    },
    {
      key: "instituteEmail",
      type: "email",
      placeholder: "Institute Email",
      icon: Mail,
      label: "Institute email",
    },
    {
      key: "phoneNumber",
      type: "tel",
      placeholder: "Phone Number",
      icon: Phone,
      label: "Phone number",
    },
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
          to   { opacity: 1; transform: translateY(0) scale(1); }
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
          50%       { transform: translateY(-10px); }
        }
        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -20px) scale(1.05); }
          66%       { transform: translate(-20px, 15px) scale(0.97); }
        }
        @keyframes grid-pan {
          from { background-position: 0 0; }
          to   { background-position: 40px 40px; }
        }
        @keyframes field-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes perk-in {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .page-animate { animation: page-in  0.4s ease both; }
        .card-animate { animation: card-in  0.55s cubic-bezier(.16,1,.3,1) 0.05s both; }
        .left-animate { animation: left-in  0.55s cubic-bezier(.16,1,.3,1) 0.1s  both; }
        .float-anim   { animation: float    6s ease-in-out infinite; }
        .orb-drift    { animation: orb-drift 12s ease-in-out infinite; }

        .field-row:nth-child(1) { animation: field-in 0.4s cubic-bezier(.16,1,.3,1) 0.15s both; }
        .field-row:nth-child(2) { animation: field-in 0.4s cubic-bezier(.16,1,.3,1) 0.22s both; }
        .field-row:nth-child(3) { animation: field-in 0.4s cubic-bezier(.16,1,.3,1) 0.29s both; }

        .perk-card:nth-child(1) { animation: perk-in 0.45s cubic-bezier(.16,1,.3,1) 0.3s  both; }
        .perk-card:nth-child(2) { animation: perk-in 0.45s cubic-bezier(.16,1,.3,1) 0.42s both; }
        .perk-card:nth-child(3) { animation: perk-in 0.45s cubic-bezier(.16,1,.3,1) 0.54s both; }

        .logo-shimmer {
          background: linear-gradient(90deg, #60a5fa 0%, #a5b4fc 40%, #60a5fa 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
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
          padding: 13px 16px 13px 42px;
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

        .perk-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          border-radius: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .perk-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
          transform: translateX(4px);
        }

        .field-icon-wrap {
          position: absolute;
          inset-y: 0; left: 0;
          display: flex; align-items: center;
          padding-left: 14px;
          pointer-events: none;
        }
      `}</style>

      <div className="page-animate min-h-screen flex" style={{ background: "#0c0c10" }}>

        {/* ─── LEFT PANEL ─────────────────────────────────────────── */}
        <div
          className="left-animate hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12"
          style={{
            background: "linear-gradient(135deg, #0f0f14 0%, #111116 100%)",
            borderRight: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Grid bg */}
          <div className="grid-bg absolute inset-0 opacity-60" />

          {/* Orbs */}
          <div
            className="orb-drift absolute rounded-full"
            style={{
              width: "420px", height: "420px",
              top: "5%", left: "-20%",
              background: "radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />
          <div
            className="orb-drift absolute rounded-full"
            style={{
              width: "320px", height: "320px",
              bottom: "10%", right: "-12%",
              background: "radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)",
              filter: "blur(50px)",
              animationDelay: "5s",
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

          {/* Hero content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center px-4 py-12">
            {/* Floating icon */}
            <div
              className="float-anim h-20 w-20 rounded-2xl flex items-center justify-center mb-8"
              style={{
                background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(79,70,229,0.1))",
                border: "1px solid rgba(79,70,229,0.3)",
                boxShadow: "0 0 40px rgba(79,70,229,0.2)",
              }}
            >
              <UserPlus style={{ height: "36px", width: "36px", color: "#60a5fa" }} />
            </div>

            <h1
              className="text-3xl font-bold mb-3 leading-tight"
              style={{ color: "#f4f4f5" }}
            >
              Request
              <br />
              <span className="logo-shimmer">Admin Access</span>
            </h1>
            <p className="text-sm leading-relaxed mb-10 max-w-xs" style={{ color: "#71717a" }}>
              Submit your details and our team will review your access request within one business day.
            </p>

            {/* Perk cards */}
            <div className="space-y-3 max-w-xs">
              {perks.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="perk-card">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(37,99,235,0.15)" }}
                  >
                    <Icon style={{ height: "15px", width: "15px", color: "#60a5fa" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#d4d4d8" }}>{title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="relative z-10 text-xs text-center" style={{ color: "#3f3f46" }}>
            © 2026 IMS Portal · IITP institute Edition
          </p>
        </div>

        {/* ─── RIGHT PANEL (Form) ─────────────────────────────────── */}
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
                  background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                  boxShadow: "0 0 24px rgba(79,70,229,0.4)",
                }}
              >
                <UserPlus style={{ height: "22px", width: "22px", color: "#fff" }} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold mb-1.5" style={{ color: "#f4f4f5" }}>
                Create a request
              </h2>
              <p className="text-sm" style={{ color: "#71717a" }}>
                Apply for an IT portal administrator account.
              </p>
            </div>

            {/* Progress bar (single-step aesthetic) */}
            <div className="flex items-center gap-2 mb-7">
              <div
                style={{
                  flex: 1, height: "3px", borderRadius: "9999px",
                  background: "linear-gradient(90deg, #2563eb, #4f46e5)",
                  boxShadow: "0 0 8px rgba(79,70,229,0.5)",
                }}
              />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(({ key, type, placeholder, icon: Icon, label }) => (
                <div key={key} className="field-row">
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "#a1a1aa" }}
                  >
                    {label}
                  </label>
                  <div className="relative">
                    <div className="field-icon-wrap">
                      <Icon style={{ height: "16px", width: "16px", color: "#52525b" }} />
                    </div>
                    <input
                      type={type}
                      required
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="input-field"
                      placeholder={placeholder}
                    />
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ marginTop: "8px" }}
              >
                {loading ? (
                  <Loader2 style={{ height: "18px", width: "18px", animation: "spin 1s linear infinite" }} />
                ) : (
                  <>
                    <span>Submit Request</span>
                    <ArrowRight style={{ height: "15px", width: "15px", marginLeft: "8px" }} />
                  </>
                )}
              </button>
            </form>

            {/* Divider + Sign in */}
            <div
              className="mt-7 pt-6 text-center"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-xs" style={{ color: "#52525b" }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#60a5fa",
                    fontWeight: 500,
                    fontSize: "12px",
                    textDecoration: "none",
                    transition: "color 0.18s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#60a5fa")}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;