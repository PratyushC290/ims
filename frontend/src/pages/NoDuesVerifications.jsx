/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Loader2,
  Download,
  Filter,
  FileText,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Pagination from "../components/Pagination";
import { exportToExcel } from "../utils/exportUtils";

const NoDuesVerifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchVerifications = useCallback(
    async (fetchPage = 1) => {
      setLoading(true);
      try {
        let url = `/no-dues/verifications?page=${fetchPage}&limit=20`;
        if (searchTerm) url += `&search=${searchTerm}`;
        if (fromDate) url += `&fromDate=${fromDate}`;
        if (toDate) url += `&toDate=${toDate}`;

        const res = await api.get(url);
        setVerifications(res.data.verifications || []);
        setPagination(res.data.pagination);
      } catch (error) {
        toast.error("Failed to load verifications");
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, fromDate, toDate]
  );

  useEffect(() => {
    fetchVerifications(page);
  }, [page]);

  const applyFilters = () => {
    setPage(1);
    fetchVerifications(1);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this verification?")) return;
    try {
      await api.delete(`/no-dues/verification/${id}`);
      toast.success("Deleted");
      fetchVerifications(page);
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const url = `/no-dues/verifications?limit=1000${searchTerm ? `&search=${searchTerm}` : ""
        }${fromDate ? `&fromDate=${fromDate}` : ""}${toDate ? `&toDate=${toDate}` : ""
        }`;

      const res = await api.get(url);
      const data = res.data.verifications || [];

      const formattedData = data.map((v) => ({
        Date: v.createdAt
          ? new Date(v.createdAt).toLocaleString()
          : "N/A",
        "Student Name": v.student?.fullname || "Unknown",
        "Student Email": v.student?.instituteEmail || "N/A",
        Status: v.status,
        "Pending Items": v.pendingCount || 0,
        "Verified By": v.verifiedBy?.fullname || "Unknown",
        Items:
          v.itemsAtVerification?.map((i) => `${i.itemName} (${i.identifier})`)
            .join(", ") || "None",
      }));

      exportToExcel(formattedData, "no_dues_verifications", "Verifications");
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
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
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
              ) : (
                verifications.map((v) => (
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

        <Pagination
          pagination={pagination}
          onPageChange={setPage}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default NoDuesVerifications;