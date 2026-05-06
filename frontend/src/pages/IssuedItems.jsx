/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, History as HistoryIcon, RotateCcw, ArrowLeftRight, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Pagination from "../components/Pagination";

const IssuedItems = () => {
  const [issuedAssets, setIssuedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [itemHistory, setItemHistory] = useState([]);

  const fetchIssuedAssets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/items/issued?page=${page}&limit=20`);
      setIssuedAssets(response.data.issuedAssets || []);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to load issued items");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchIssuedAssets();
  }, [fetchIssuedAssets]);

  const filteredIssued = issuedAssets.filter((asset) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      asset.catalogItem?.name?.toLowerCase().includes(term) ||
      asset.identifier?.toLowerCase().includes(term) ||
      asset.user?.fullname?.toLowerCase().includes(term) ||
      asset.user?.studentId?.toLowerCase().includes(term) ||
      asset.user?.instituteEmail?.toLowerCase().includes(term)
    );
  });

  const handleReturn = async (asset) => {
    const itemName = asset.catalogItem?.name || "Unknown Item";
    const identifier = asset.identifier || "N/A";
    
    if (!window.confirm(`Return ${itemName} (${identifier})?`)) {
      return;
    }

    try {
      await api.put(`/items/return/${asset._id}`);
      toast.success("Item returned successfully");
      fetchIssuedAssets();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to return item");
    }
  };

  const handleHistory = async (itemId) => {
    try {
      const response = await api.get(`/history/item/${itemId}`);
      setItemHistory(response.data.history || []);
      setHistoryModalOpen(true);
    } catch (error) {
      toast.error("Failed to load history");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Issued":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Returned":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Maintenance":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
          <h1 className="text-2xl font-bold text-[var(--theme-text)] tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6" />
            Return Items
          </h1>
          <p className="text-sm text-[var(--theme-text-muted)] mt-1">
            View and manage issued items for return.
          </p>
        </div>
      </div>

      <div className="bg-[var(--theme-panel)] rounded-2xl shadow-sm border border-[var(--theme-border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--theme-border)]">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text-muted)]" />
            <input
              type="text"
              placeholder="Search by item name, identifier, or issued to..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--theme-bg)] border-b border-[var(--theme-border)]">
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Item
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Identifier
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Issued To
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Status
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Issued Date
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--theme-border)]">
              {filteredIssued.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--theme-text-muted)]">
                    No issued items found
                  </td>
                </tr>
              ) : (
                filteredIssued.map((asset) => (
                  <tr
                    key={asset._id}
                    className="hover:bg-[var(--theme-bg)] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-[var(--theme-text)]">
                        {asset.catalogItem?.name || "Unknown"}
                      </div>
                      {asset.catalogItem?.category && (
                        <div className="text-xs text-[var(--theme-text-muted)]">
                          {asset.catalogItem.category}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-[var(--theme-text)] font-mono">
                      {asset.identifier || "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-[var(--theme-text)]">
                        {asset.user?.fullname || "Unknown"}
                      </div>
                      <div className="text-xs text-[var(--theme-text-muted)]">
                        {asset.user?.instituteEmail || "No email"}
                      </div>
                      {asset.user?.role && (
                        <div className="text-xs text-[var(--theme-text-muted)]">
                          {asset.user.role}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                          asset.status
                        )}`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[var(--theme-text)]">
                      {formatDate(asset.issuedAt)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleHistory(asset.catalogItem?._id)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="View History"
                        >
                          <HistoryIcon className="h-4 w-4" />
                        </button>
                        {asset.status === "Issued" && (
                          <button
                            onClick={() => handleReturn(asset)}
                            className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Return Item"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
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

      {historyModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--theme-panel)] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-[var(--theme-border)] shadow-xl">
            <div className="p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--theme-text)]">
                Item History
              </h3>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="p-2 hover:bg-[var(--theme-bg)] rounded-lg"
              >
                <X className="h-5 w-5 text-[var(--theme-text-muted)]" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {itemHistory.length === 0 ? (
                <p className="text-center text-[var(--theme-text-muted)] py-8">
                  No history found
                </p>
              ) : (
                <div className="space-y-3">
                  {itemHistory.map((entry) => (
                    <div
                      key={entry._id}
                      className="p-3 bg-[var(--theme-bg)] rounded-lg border border-[var(--theme-border)]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            entry.action === "Assigned"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-emerald-500/10 text-emerald-500"
                          }`}
                        >
                          {entry.action}
                        </span>
                        <span className="text-xs text-[var(--theme-text-muted)]">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--theme-text)]">
                        {entry.targetUser?.fullname || "Unknown"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuedItems;