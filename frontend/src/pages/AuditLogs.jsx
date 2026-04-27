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
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Pagination from "../components/Pagination";
import { exportAuditLogs } from "../utils/exportUtils";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
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
          return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        case "Returned":
          return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        case "Sent to Maintenance":
          return "bg-amber-500/10 text-amber-500 border-amber-500/20";
        case "Removed from Maintenance":
          return "bg-green-500/10 text-green-500 border-green-500/20";
        default:
          return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      }
    };

  const getActionIcon = (action) => {
    return <ArrowRight className="h-3 w-3" />;
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportAuditLogs(api);
      toast.success("Audit log exported successfully");
    } catch (error) {
      toast.error("Failed to export audit log");
    } finally {
      setExporting(false);
    }
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
          <h1 className="text-2xl font-bold text-[var(--theme-text)] tracking-tight">
            Audit Logs
          </h1>
          <p className="text-sm text-[var(--theme-text-muted)] mt-1">
            Complete history of all inventory actions.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export Audit Log
        </button>
      </div>

      <div className="bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-4 border-b border-[var(--theme-border)]">
          <div className="relative w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
            <input
              type="text"
              placeholder="Search by item, user, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--theme-bg)] border-b border-[var(--theme-border)]">
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Action
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Item
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  User
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Authorized By
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Date & Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--theme-border)]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--theme-text-muted)]">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-[var(--theme-bg)] transition-colors"
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
                        <div className="h-8 w-8 rounded-lg bg-[var(--theme-bg)] flex items-center justify-center border border-[var(--theme-border)]">
                          <MonitorSmartphone className="h-4 w-4 text-[var(--theme-text-muted)]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[var(--theme-text)]">
                            {log.item?.name || "Unknown"}
                          </div>
                          <div className="text-xs text-[var(--theme-text-muted)] font-mono">
                            {log.item?.identifier || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[var(--theme-text-muted)]" />
                        <span className="text-sm text-[var(--theme-text)]">
                          {log.targetUser?.fullname || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-[var(--theme-text-muted)]">
                      {log.authorizedBy?.fullname || "System"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-[var(--theme-text-muted)]">
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