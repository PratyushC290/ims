import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Mail, User, Phone, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    instituteEmail: "",
    phoneNumber: "", // Added to match your backend
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Pointing this to your actual auth route!
      // (Make sure this URL matches what is in your auth.routes.js)
      const response = await api.post("/auth/signup", formData);

      // Using the exact success message sent from your backend
      toast.success(response.data.message, { duration: 5000 });
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-white">
      <div className="max-w-md w-full bg-white/60 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 border border-white/80">
        <div className="text-center mb-10">
          <div className="mx-auto h-20 w-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-gray-100 overflow-hidden">
            <img src="/iitp-logo.png" alt="IITP" className="h-16 w-16 object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Request Admin Access
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              required
              value={formData.fullname}
              onChange={(e) =>
                setFormData({ ...formData, fullname: e.target.value })
              }
              className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
              placeholder="Full Legal Name"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              required
              value={formData.instituteEmail}
              onChange={(e) =>
                setFormData({ ...formData, instituteEmail: e.target.value })
              }
              className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
              placeholder="Institute Email"
            />
          </div>

          {/* Phone Number */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
              placeholder="Phone Number"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-medium text-white bg-[#1C1C1E] hover:bg-black shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] transition-all mt-8"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Submit Request"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
