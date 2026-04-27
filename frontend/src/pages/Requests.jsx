import { useState, useEffect } from "react";
import { Search, Clock, CheckCircle, XCircle, FileText, Filter, Loader2, Package, User, Calendar, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import FulfillModal from "../components/FulfillModal";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState({ isOpen: false, requestId: null });
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [activeTab, searchTerm]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === "pending" ? "Pending" : activeTab === "history" ? "Rejected,Fulfilled" : "";
      const res = await api.get(`/requests/all?${statusFilter ? `status=${statusFilter}&` : ''}search=${searchTerm}`);
      setRequests(res.data.requests);
    } catch (error) {
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setRejecting(true);
      await api.patch(`/requests/${showRejectModal.requestId}/status`, {
        status: "Rejected"
      });
      toast.success("Request rejected");
      setShowRejectModal({ isOpen: false, requestId: null });
      setRejectReason("");
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setRejecting(false);
    }
  };

  const handleFulfill = (request) => {
    setSelectedRequest(request);
    setShowFulfillModal(true);
  };

  const handleFulfillSuccess = () => {
    setShowFulfillModal(false);
    setSelectedRequest(null);
    fetchRequests();
  };

  const handleOpenReject = (requestId) => {
    setShowRejectModal({ isOpen: true, requestId });
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      Approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
      Fulfilled: "bg-green-500/20 text-green-400 border-green-500/30",
    };
    return styles[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  return (
    <div>
      <FulfillModal
        isOpen={showFulfillModal}
        onClose={() => {
          setShowFulfillModal(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onSuccess={handleFulfillSuccess}
      />

      {showRejectModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRejectModal({ isOpen: false, requestId: null })} />
          <div className="relative bg-[var(--theme-panel)] rounded-3xl shadow-2xl max-w-md w-full p-6 border border-[var(--theme-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-600/20 rounded-xl">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-[var(--theme-text)]">Reject Request</h2>
            </div>
            <p className="text-sm text-[var(--theme-text-muted)] mb-4">
              Are you sure you want to reject this request? This action cannot be undone.
            </p>
            <textarea
              placeholder="Reason for rejection (optional)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 resize-none"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal({ isOpen: false, requestId: null })}
                className="flex-1 py-3 bg-[var(--theme-bg)] text-[var(--theme-text)] rounded-xl font-semibold border border-[var(--theme-border)]"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {rejecting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Hardware Requests</h1>
        <p className="text-sm text-[var(--theme-text-muted)] mt-1">
          Manage student hardware requests
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 bg-[var(--theme-panel)] p-1.5 rounded-xl border border-[var(--theme-border)]">
          {[
            { key: "pending", label: "Pending", icon: Clock },
            { key: "history", label: "History", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-[var(--theme-accent)] text-white shadow-sm"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text-muted)]" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full sm:w-64 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-[var(--theme-panel)] rounded-3xl border border-[var(--theme-border)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent)]" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-[var(--theme-bg)] rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-[var(--theme-text-muted)]" />
            </div>
            <p className="text-[var(--theme-text-muted)] font-medium">No requests found</p>
            <p className="text-sm text-[var(--theme-text-muted)] opacity-70 mt-1">
              {activeTab === "pending" ? "No pending requests to review" : "No past requests"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--theme-border)] bg-[var(--theme-bg)]">
                  <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)]">Student</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)]">Requested Items</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)]">Reason</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)]">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)]">Status</th>
                  {activeTab === "pending" && (
                    <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)] text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border)]">
                {requests.map((request) => (
                  <tr
                    key={request._id}
                    className="hover:bg-[var(--theme-bg)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--theme-text)]">
                            {request.user?.fullname}
                          </p>
                          <p className="text-sm text-[var(--theme-text-muted)]">
                            {request.user?.instituteEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {request.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-[var(--theme-text-muted)]" />
                            <span className="font-medium text-[var(--theme-text)]">
                              {item.itemType} <span className="text-[var(--theme-text-muted)] text-xs ml-1">x{item.quantity}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                      {request.location && (
                        <div className="mt-2 text-xs text-blue-500 font-semibold border border-blue-500/20 bg-blue-500/10 px-2 py-1 rounded-md inline-block">
                          Loc: {request.location}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-[var(--theme-text-muted)] line-clamp-2">
                        {request.reason}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--theme-text-muted)]">
                        <Calendar className="h-4 w-4" />
                        {new Date(request.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusBadge(request.status)}`}>
                        {request.status === "Pending" && <Clock className="h-3 w-3 mr-1.5" />}
                        {request.status === "Fulfilled" && <CheckCircle className="h-3 w-3 mr-1.5" />}
                        {request.status === "Rejected" && <XCircle className="h-3 w-3 mr-1.5" />}
                        {request.status}
                      </span>
                    </td>
                    {activeTab === "pending" && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenReject(request._id)}
                            className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg font-medium hover:bg-red-500/20 transition-colors text-sm"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleFulfill(request)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm flex items-center gap-1.5"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Fulfill
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;