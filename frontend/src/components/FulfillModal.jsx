import { useState, useEffect } from "react";
import { X, Package, Search, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

const FulfillModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [fulfilling, setFulfilling] = useState(false);

  useEffect(() => {
    if (isOpen && request) {
      fetchAvailableItems();
    }
  }, [isOpen, request]);

  useEffect(() => {
    if (isOpen && request) {
      fetchAvailableItems();
    }
  }, [isOpen, request]);

  const fetchAvailableItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/items?limit=100");
      const allItems = res.data.items || [];
      const available = allItems.filter(item => item.availableQuantity > 0);
      setItems(available);
    } catch (error) {
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async () => {
    if (!selectedItemId) {
      toast.error("Please select an item from the catalog");
      return;
    }
    if (!identifier.trim()) {
      toast.error("Please enter the asset identifier / serial number");
      return;
    }

    try {
      setFulfilling(true);
      await api.post(`/requests/${request._id}/fulfill`, {
        catalogItemId: selectedItemId,
        identifier: identifier.trim()
      });
      toast.success("Request fulfilled successfully!");
      onSuccess();
      setIdentifier("");
      setSelectedItemId("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fulfill request");
    } finally {
      setFulfilling(false);
    }
  };

  if (!isOpen || !request) return null;

  const filteredItems = items.filter(item => {
    const search = searchTerm.toLowerCase();
    return item.name.toLowerCase().includes(search) || 
           item.category?.toLowerCase().includes(search);
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[var(--theme-panel)] rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-[var(--theme-border)] animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-green-600/20 rounded-xl">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--theme-text)]">Fulfill Request</h2>
            <p className="text-sm text-[var(--theme-text-muted)]">
              For: {request.user?.fullname}
            </p>
          </div>
        </div>

        <div className="bg-[var(--theme-bg)] rounded-2xl p-4 mb-4 border border-[var(--theme-border)]">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-[var(--theme-text-muted)]" />
            <span className="font-medium text-[var(--theme-text)]">{request.requestedItem}</span>
          </div>
          <p className="text-sm text-[var(--theme-text-muted)]">{request.reason}</p>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
            Select Catalog Item
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text-muted)]" />
            <input
              type="text"
              placeholder="Search available items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="max-h-32 overflow-y-auto mb-4 rounded-xl border border-[var(--theme-border)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-green-500" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-[var(--theme-text-muted)]">
              No available stock
            </div>
          ) : (
            filteredItems.map(item => (
              <label
                key={item._id}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--theme-bg)] ${
                  selectedItemId === item._id ? "bg-green-500/10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="selectedItem"
                    value={item._id}
                    checked={selectedItemId === item._id}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="h-4 w-4 text-green-600"
                  />
                  <div>
                    <p className="font-medium text-[var(--theme-text)]">{item.name}</p>
                    <p className="text-xs text-[var(--theme-text-muted)]">{item.category}</p>
                  </div>
                </div>
                <span className="text-sm text-green-500 font-medium">
                  {item.availableQuantity} available
                </span>
              </label>
            ))
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
            Asset Identifier / Serial Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. LAP-001, DELL-2024-001"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-[var(--theme-text-muted)] mt-1">
            Enter the unique identifier/serial number you're physically handing to the student
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[var(--theme-bg)] text-[var(--theme-text)] rounded-xl font-semibold border border-[var(--theme-border)] hover:bg-[var(--theme-border)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleFulfill}
            disabled={fulfilling || !selectedItemId || !identifier.trim()}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {fulfilling ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Issue & Fulfill
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FulfillModal;