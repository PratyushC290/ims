/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MonitorSmartphone,
  Calendar,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [userResponse, itemsResponse] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get("/items"),
      ]);
      setUser(userResponse.data);
      setItems(itemsResponse.data.items);
    } catch (error) {
      toast.error("Failed to load user details");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [userId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const issuedItems = items.filter(
    (item) => item.assignedTo?._id === userId
  );

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4">
                {user.fullname?.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {user.fullname}
              </h2>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border mt-2
                ${user.role === "Super Admin" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : ""}
                ${user.role === "Admin" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                ${["Student", "Staff", "Faculty"].includes(user.role) ? "bg-gray-50 text-gray-700 border-gray-200" : ""}
              `}
              >
                {user.role}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{user.instituteEmail}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MonitorSmartphone className="h-5 w-5" />
              Assigned Items
            </h3>

            {issuedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <MonitorSmartphone className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm">No items assigned to this user</p>
              </div>
            ) : (
              <div className="space-y-3">
                {issuedItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                        <MonitorSmartphone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm font-mono text-gray-500">
                          {item.identifier}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {formatDate(item.updatedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;