/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import {
  History,
  MonitorSmartphone,
  User,
  Loader2,
  Search,
  ArrowRight,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Pagination from "../components/Pagination";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/history/global?page=${page}&limit=20`);
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.item?.name?.toLowerCase().includes(term) ||
      log.item?.identifier?.toLowerCase().includes(term) ||
      log.targetUser?.fullname?.toLowerCase().includes(term) ||
      log.action?.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionStyle = (action) => {
    switch (action) {
      case "Assigned":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Returned":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Sent to Maintenance":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Removed from Maintenance":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getActionIcon = (action) => {
    return <ArrowRight className="h-3 w-3" />;
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Audit Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete history of all inventory actions.
          </p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-4 border-b border-gray-100/50">
          <div className="relative w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by item, user, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/40 border-b border-gray-100">
                <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                  Action
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                  Item
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                  User
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                  Authorized By
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                  Date & Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-white/40 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getActionStyle(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                          <MonitorSmartphone className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.item?.name || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {log.item?.identifier || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {log.targetUser?.fullname || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {log.authorizedBy?.fullname || "System"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          pagination={pagination}
          onPageChange={setPage}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AuditLogs;