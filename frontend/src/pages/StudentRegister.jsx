import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Mail, Phone, User, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    instituteEmail: "",
    phoneNumber: "",
    studentId: "",
    branch: "",
    alternativeEmail: "",
    phdGuide: "",
    otpCode: "",
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!formData.fullname || !formData.instituteEmail || !formData.phoneNumber || !formData.studentId || !formData.branch) {
      return toast.error("Please fill in all mandatory fields");
    }
    setLoading(true);

    try {
      await api.post("/auth/signup-student", formData);
      toast.success("OTP sent! Please verify.");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (formData.otpCode.length !== 6) {
      return toast.error("Enter 6-digit OTP");
    }
    setLoading(true);

    try {
      await api.post("/auth/verify-student-signup", formData);
      toast.success("Registration successful! Please login.");
      navigate("/student-login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-white">
      <div className="max-w-md w-full bg-white/60 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 border border-white/80">
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-gray-100">
            {step === 1 ? (
              <UserPlus className="h-6 w-6 text-gray-800" strokeWidth={2.5} />
            ) : (
              <KeyRound className="h-6 w-6 text-gray-800" strokeWidth={2.5} />
            )}
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {step === 1 ? "Student Registration" : "Verify Email"}
          </h2>
          <p className="text-sm text-gray-500">
            {step === 1
              ? "Register to request hardware from the institute."
              : `Code sent to ${formData.instituteEmail}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.fullname}
                  onChange={(e) =>
                    setFormData({ ...formData, fullname: e.target.value })
                  }
                  placeholder="Enter your full name"
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institute Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.instituteEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, instituteEmail: e.target.value })
                  }
                  placeholder="your.email@institute.edu"
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="+91 9876543210"
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  placeholder="Enter Student ID"
                  className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch/Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData({ ...formData, branch: e.target.value })
                  }
                  placeholder="e.g. Computer Science"
                  className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alternative Email-ID <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.alternativeEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, alternativeEmail: e.target.value })
                  }
                  placeholder="alternative@example.com"
                  className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PhD Guide Name <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.phdGuide}
                  onChange={(e) =>
                    setFormData({ ...formData, phdGuide: e.target.value })
                  }
                  placeholder="e.g. Dr. John Doe"
                  className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
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
                "Send OTP"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={formData.otpCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    otpCode: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="block w-full text-center text-2xl tracking-[0.75em] py-4 bg-gray-50/50 border border-gray-200/80 rounded-xl text-gray-900 placeholder-gray-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                placeholder="000000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-medium text-white bg-[#1C1C1E] hover:bg-black shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-8"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Verify & Register"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setFormData({ ...formData, otpCode: "" });
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Change details
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/student-login")}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;