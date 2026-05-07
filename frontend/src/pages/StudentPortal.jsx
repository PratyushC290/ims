import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, XCircle, Plus, MonitorSmartphone, Cpu, Cable, Headphones,Camera, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import RequestModal from "../components/RequestModal";
import PrintableRequest from "../components/PrintableRequest";

const StudentPortal = () => {
  const [issuedItems, setIssuedItems] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [fullUser, setFullUser] = useState(null);
  const [requestToPrint, setRequestToPrint] = useState(null);

  useEffect(() => {
    getCurrentUserId();
    fetchData();
  }, []);

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserProfile(payload);
        return payload.userId;
      }
    } catch (e) {
      console.error("Failed to decode token", e);
    }
    return null;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      
      const promises = [
        api.get("/items/my-issued"),
        api.get("/requests/my-requests"),
        api.get("/items"),
      ];
      
      if (userId) {
        promises.push(api.get(`/users/${userId}`));
      }

      const results = await Promise.all(promises);
      const issuedRes = results[0];
      const requestsRes = results[1];
      
      if (userId && results[3]) {
        setFullUser(results[3].data);
      }

      const issued = issuedRes.data.issuedAssets || [];
      setIssuedItems(issued);
      setMyRequests(requestsRes.data.requests || []);

    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-amber-500/20 text-amber-400";
      case "Approved": return "bg-blue-500/20 text-blue-400";
      case "Rejected": return "bg-red-500/20 text-red-400";
      case "Fulfilled": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return Clock;
      case "Approved": return CheckCircle;
      case "Rejected": return XCircle;
      case "Fulfilled": return CheckCircle;
      default: return Clock;
    }
  };

  const handleRequestSubmitted = (newRequest) => {
    setMyRequests(prev => [newRequest, ...prev]);
    setShowRequestModal(false);
    setRequestToPrint(newRequest);
    toast.success("Request submitted! Please download the form and get it signed.");
  };

  return (
    <div className="min-h-screen">
      <RequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={handleRequestSubmitted}
        userRole={fullUser?.role || "Student"}
      />

      <div id="print-root" className="hidden print:block absolute top-0 left-0 w-full min-h-screen bg-white z-[9999]">
        <PrintableRequest request={requestToPrint} currentUser={fullUser} />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <img src="/iitp-logo.png" alt="IITP" className="h-20 w-20 object-contain rounded-xl bg-white p-1.5" />
            <div>
              <h1 className="text-4xl font-bold text-[var(--theme-text)]">
                Welcome back, {userProfile.fullname?.split(' ')[0] || fullUser?.role || 'User'}!
              </h1>
              <p className="text-[var(--theme-text-muted)] mt-1 text-lg">
                IIT Patna CC Office Inventory
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            Request Hardware
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[var(--theme-panel)] rounded-3xl border border-[var(--theme-border)] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-600/20 rounded-xl">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-[var(--theme-text)]">My Issued Assets</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : issuedItems.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--theme-bg)] rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-[var(--theme-text-muted)]" />
              </div>
              <p className="text-[var(--theme-text-muted)] font-medium">No assets assigned yet</p>
              <p className="text-sm text-[var(--theme-text-muted)] opacity-70 mt-1">
                Request hardware using the button above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {issuedItems.map(item => (
                <div
                  key={item._id}
                  className="bg-[var(--theme-bg)] rounded-2xl p-4 border border-[var(--theme-border)] hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                      <MonitorSmartphone className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--theme-text)]">
                        {item.catalogItem?.name || item.identifier}
                      </h3>
                      <p className="text-sm text-[var(--theme-text-muted)] font-mono">
                        {item.identifier}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--theme-text-muted)]">
                    Issued: {new Date(item.issuedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[var(--theme-panel)] rounded-3xl border border-[var(--theme-border)] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-600/20 rounded-xl">
              <Clock className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-[var(--theme-text)]">My Requests</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--theme-bg)] rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-[var(--theme-text-muted)]" />
              </div>
              <p className="text-[var(--theme-text-muted)] font-medium">No requests yet</p>
              <p className="text-sm text-[var(--theme-text-muted)] opacity-70 mt-1">
                Create a request to get hardware
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {myRequests.map(request => {
                const StatusIcon = getStatusIcon(request.status);
                return (
                  <div
                    key={request._id}
                    className="bg-[var(--theme-bg)] rounded-2xl p-4 border border-[var(--theme-border)] hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex flex-col gap-1">
                          {request.items?.map((item, idx) => (
                            <h3 key={idx} className="font-semibold text-[var(--theme-text)]">
                              {item.itemType} <span className="text-[var(--theme-text-muted)] text-xs ml-1">x{item.quantity}</span>
                            </h3>
                          ))}
                        </div>
                        {request.location && (
                          <div className="mt-1.5 text-xs text-blue-500 font-semibold border border-blue-500/20 bg-blue-500/10 px-2 py-1 rounded-md inline-block">
                            Loc: {request.location}
                          </div>
                        )}
                        <p className="text-sm text-[var(--theme-text-muted)] mt-1.5 line-clamp-2">
                          {request.reason}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {request.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-[var(--theme-text-muted)] opacity-70">
                        {new Date(request.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <button
                        onClick={() => {
                          setRequestToPrint(request);
                          setTimeout(() => window.print(), 100);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        Print Document
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {myRequests.some(request => request.status === "Pending") && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-3xl p-6 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
              <Clock className="h-7 w-7 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-500 mb-1">
                Pending Request Instructions
              </h3>
              <p className="text-amber-500/90 text-lg">
                Please get all the required signatures in the above form and report to the CC Office
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;