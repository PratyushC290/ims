/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { Search, Loader2, Download, FileText, User, Calendar, CheckCircle, XCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import { exportToExcel } from "../utils/exportUtils";

const NoDuesVerifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const debouncedFromDate = useDebounce(fromDate, 300);
  const debouncedToDate = useDebounce(toDate, 300);

  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/no-dues/verifications`);
      setVerifications(res.data.verifications || []);
    } catch (error) {
      toast.error("Failed to load verifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const filteredVerifications = verifications.filter((v) => {
    if (!debouncedSearch) {
    } else {
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch =
        v.student?.fullname?.toLowerCase().includes(searchLower) ||
        v.student?.instituteEmail?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (debouncedFromDate && v.createdAt) {
      const vDate = new Date(v.createdAt);
      const from = new Date(debouncedFromDate);
      from.setHours(0, 0, 0, 0);
      if (vDate < from) return false;
    }

    if (debouncedToDate && v.createdAt) {
      const vDate = new Date(v.createdAt);
      const to = new Date(debouncedToDate);
      to.setHours(23, 59, 59, 999);
      if (vDate > to) return false;
    }

    return true;
  });

  const handleDelete = async (id) => {
    if (!confirm("Delete this verification?")) return;
    try {
      await api.delete(`/no-dues/verification/${id}`);
      toast.success("Deleted");
      fetchVerifications();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleExport = () => {
    setExporting(true);
    try {
      const data = filteredVerifications.map((v) => ({
        Date: v.createdAt ? new Date(v.createdAt).toLocaleString() : "N/A",
        "Student Name": v.student?.fullname || "Unknown",
        "Student Email": v.student?.instituteEmail || "N/A",
        Status: v.status,
        "Pending Items": v.pendingCount || 0,
        "Verified By": v.verifiedBy?.fullname || "Unknown",
        Items: v.itemsAtVerification?.map((i) => `${i.itemName} (${i.identifier})`).join(", ") || "None",
      }));

      exportToExcel(data, "no_dues_verifications", "Verifications");
      toast.success("Exported successfully!");
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && verifications.length === 0) {
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
          <h1 className="text-2xl font-bold text-[var(--theme-text)] tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            No Dues Records
          </h1>
          <p className="text-sm text-[var(--theme-text-muted)] mt-1">
            View and export all no dues verification records.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export
        </button>
      </div>

      <div className="bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-4xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--theme-border)]">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative w-64">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="text-[var(--theme-text-muted)]">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--theme-bg)] border-b border-[var(--theme-border)]">
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Date
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Student
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Status
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Pending Items
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Verified By
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Items Detail
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--theme-border)]">
              {verifications.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-[var(--theme-text-muted)]"
                  >
                    No verifications found
                  </td>
                </tr>
              ) : filteredVerifications.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-[var(--theme-text-muted)]"
                  >
                    No verifications found matching your filters
                  </td>
                </tr>
              ) : (
                filteredVerifications.map((v) => (
                  <tr
                    key={v._id}
                    className="hover:bg-[var(--theme-bg)] transition-colors"
                  >
                    <td className="py-4 px-6 text-[var(--theme-text)]">
                      {formatDate(v.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-[var(--theme-text)]">
                        {v.student?.fullname || "Unknown"}
                      </div>
                      <div className="text-xs text-[var(--theme-text-muted)]">
                        {v.student?.instituteEmail || ""}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${v.status === "Cleared"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                          }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[var(--theme-text)]">
                      {v.pendingCount || 0}
                    </td>
                    <td className="py-4 px-6 text-[var(--theme-text)]">
                      {v.verifiedBy?.fullname || "Unknown"}
                    </td>
                    <td className="py-4 px-6 text-[var(--theme-text)] text-sm max-w-xs">
                      <div className="truncate">
                        {v.itemsAtVerification?.length > 0
                          ? v.itemsAtVerification.map((i) => i.identifier).join(", ")
                          : "None"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleDelete(v._id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NoDuesVerifications;