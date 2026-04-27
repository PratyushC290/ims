import { useState, useEffect } from "react";
import { X, Package, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

const RequestModal = ({ isOpen, onClose, onSuccess }) => {
  const [hardwareTypes, setHardwareTypes] = useState([]);
  const [requestedItem, setRequestedItem] = useState("");
  const [reason, setReason] = useState("");
  const [customItem, setCustomItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchHardwareTypes();
    }
  }, [isOpen]);

  const fetchHardwareTypes = async () => {
    try {
      setFetching(true);
      const res = await api.get("/items");
      const items = res.data.items || [];
      const types = items.map(item => ({
        value: item.name,
        label: item.name
      }));
      setHardwareTypes(types);
    } catch (error) {
      console.error("Failed to fetch hardware types");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const itemValue = requestedItem === "Other" ? customItem : requestedItem;
    
    if (!itemValue || !reason.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/requests", {
        requestedItem: itemValue,
        reason: reason.trim(),
      });

      onSuccess(res.data.request);
      
      setRequestedItem("");
      setReason("");
      setCustomItem("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative bg-[var(--theme-panel)] rounded-3xl shadow-2xl max-w-md w-full p-6 border border-[var(--theme-border)] animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-600/20 rounded-xl">
            <Package className="h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-[var(--theme-text)]">Request Hardware</h2>
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
                Hardware Type Needed
              </label>
              <select
                value={requestedItem}
                onChange={(e) => {
                  setRequestedItem(e.target.value);
                  if (e.target.value !== "Other") setCustomItem("");
                }}
                className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select hardware type...</option>
                {hardwareTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
                <option value="Other">Other (specify below)</option>
              </select>
              
              {requestedItem === "Other" && (
                <input
                  type="text"
                  placeholder="Specify hardware..."
                  value={customItem}
                  onChange={(e) => setCustomItem(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mt-3"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
                Reason for Request
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you need this hardware..."
                rows={4}
                className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-[var(--theme-bg)] text-[var(--theme-text)] rounded-xl font-semibold border border-[var(--theme-border)] hover:bg-[var(--theme-border)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !requestedItem || !reason.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestModal;