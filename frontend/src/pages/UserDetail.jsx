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
  History as HistoryIcon,
  User,
  GraduationCap,
  Building,
  MailPlus,
  BookOpen
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [userResponse, issuedResponse, historyResponse] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get(`/items/user/${userId}/issued`),
        api.get(`/users/${userId}/history`)
      ]);
      setUser(userResponse.data);
      setItems(issuedResponse.data.issuedAssets);
      setHistory(historyResponse.data.history);
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

  const issuedItems = items || [];

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
        className="flex items-center gap-2 text-sm text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-4xl shadow-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4">
                {user.fullname?.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-[var(--theme-text)]">
                {user.fullname}
              </h2>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border mt-2
                ${user.role === "Super Admin" ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" : ""}
                ${user.role === "Admin" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : ""}
                ${["Student", "Staff", "Faculty"].includes(user.role) ? "bg-gray-500/10 text-gray-500 border-gray-500/20" : ""}
              `}
              >
                {user.role}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-[var(--theme-text-muted)] opacity-70" />
                <span className="text-[var(--theme-text-muted)]">{user.instituteEmail}</span>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-[var(--theme-text-muted)] opacity-70" />
                  <span className="text-[var(--theme-text-muted)]">{user.phoneNumber}</span>
                </div>
              )}
              {user.studentId && (
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="h-4 w-4 text-[var(--theme-text-muted)] opacity-70" />
                  <span className="text-[var(--theme-text-muted)]">{user.studentId}</span>
                </div>
              )}
              {user.branch && (
                <div className="flex items-center gap-3 text-sm">
                  <Building className="h-4 w-4 text-[var(--theme-text-muted)] opacity-70" />
                  <span className="text-[var(--theme-text-muted)]">{user.branch}</span>
                </div>
              )}
              {user.alternativeEmail && (
                <div className="flex items-center gap-3 text-sm">
                  <MailPlus className="h-4 w-4 text-[var(--theme-text-muted)] opacity-70" />
                  <span className="text-[var(--theme-text-muted)]">{user.alternativeEmail}</span>
                </div>
              )}
              {user.role === "Student" && user.phdGuide && (
                <div className="flex items-center gap-3 text-sm">
                  <BookOpen className="h-4 w-4 text-[var(--theme-text-muted)] opacity-70" />
                  <span className="text-[var(--theme-text-muted)]">Guide: {user.phdGuide}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-4xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-4 flex items-center gap-2">
              <MonitorSmartphone className="h-5 w-5" />
              Assigned Items
            </h3>

            {issuedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[var(--theme-text-muted)]">
                <MonitorSmartphone className="h-12 w-12 opacity-30 mb-3" />
                <p className="text-sm">No items assigned to this user</p>
              </div>
            ) : (
              <div className="space-y-3">
                {issuedItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-4 bg-[var(--theme-bg)] rounded-xl border border-[var(--theme-border)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <MonitorSmartphone className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium text-[var(--theme-text)]">
                          {item.catalogItem?.name || "Asset"}
                        </div>
                        <div className="text-xs text-[var(--theme-text-muted)] font-mono">
                          {item.identifier}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--theme-text-muted)]">
                      <Calendar className="h-4 w-4" />
                      {formatDate(item.updatedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-4xl shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-4 flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              Activity History
            </h3>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-[var(--theme-text-muted)]">
                <p className="text-sm">No recorded history</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-[var(--theme-border)] ml-3 space-y-6 pb-2">
                {history.map((log) => (
                  <div key={log._id} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-[var(--theme-panel)] border-2 border-blue-500"></div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--theme-text-muted)] mb-1">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      <span className="text-sm font-semibold text-[var(--theme-text)] mb-1">
                        {log.action}
                      </span>
                      <span className="text-sm text-[var(--theme-text-muted)] font-mono">
                        {log.itemName || log.item?.name || (log.itemIdentifier?.includes("-") ? log.itemIdentifier.split("-")[0] : "Asset")} 
                        { (log.itemIdentifier || log.notes) ? ` (${log.itemIdentifier || log.notes.split(' - ')[0]})` : ''}
                      </span>
                      <span className="text-xs text-[var(--theme-text-muted)] opacity-70 mt-1">
                        Authorized by: {log.authorizedBy?.fullname}
                      </span>
                      {log.image && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-[var(--theme-border)] max-w-xs shadow-sm">
                          <img src={log.image} alt="Return proof" className="w-full h-auto object-cover" />
                        </div>
                      )}
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