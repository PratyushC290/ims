import { useState, useEffect } from "react";
import { X, Package, Loader2, Plus, Minus, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

const RequestModal = ({ isOpen, onClose, onSuccess, userRole = "Student" }) => {
  const [items, setItems] = useState([{ itemType: "", quantity: 1 }]);
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const studentAllowedItems = ["PC"];
  const facultyAllowedItems = ["PC", "Printer", "Laptop"];
  const staffAllowedItems = ["PC", "Printer", "Laptop"];

  const getAllowedItems = () => {
    switch (userRole) {
      case "Student": return studentAllowedItems;
      case "Faculty": return facultyAllowedItems;
      case "Staff": return staffAllowedItems;
      default: return studentAllowedItems;
    }
  };

  const allowedItems = getAllowedItems();
  const isFreeTextRole = ["Staff", "Admin", "Super Admin"].includes(userRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate items against role restrictions
    if (!isFreeTextRole) {
      for (const item of items) {
        if (item.itemType && !allowedItems.includes(item.itemType)) {
          toast.error(`You can only request: ${allowedItems.join(", ")}`);
          return;
        }
      }
    }

    const formattedItems = items.map(item => ({
      itemType: item.itemType.trim(),
      quantity: item.quantity
    }));
    
    if (formattedItems.some(i => !i.itemType) || !location.trim() || !reason.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/requests", {
        items: formattedItems,
        location: location.trim(),
        reason: reason.trim(),
      });

      onSuccess(res.data.request);
      
      setItems([{ itemType: "", quantity: 1 }]);
      setLocation("");
      setReason("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { itemType: "", quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative bg-[var(--theme-panel)] rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-[var(--theme-border)] animate-in fade-in zoom-in-95 duration-200">
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

        <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-600">
              {isFreeTextRole 
                ? "You can request any hardware item. Please specify clearly."
                : <span>You can request: <strong>{allowedItems.join(", ")}</strong></span>
              }
            </p>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--theme-text)]">
              Hardware Items Needed
            </label>
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start bg-[var(--theme-bg)] p-3 rounded-xl border border-[var(--theme-border)]">
                <div className="flex-1">
                  {isFreeTextRole ? (
                    <input
                      type="text"
                      value={item.itemType}
                      onChange={(e) => updateItem(index, "itemType", e.target.value)}
                      placeholder="Enter hardware name..."
                      className="w-full px-3 py-2 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  ) : (
                    <select
                      value={item.itemType}
                      onChange={(e) => updateItem(index, "itemType", e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="">Select hardware...</option>
                      {allowedItems.map((hw) => (
                        <option key={hw} value={hw}>{hw}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateItem(index, "quantity", Math.max(1, item.quantity - 1))}
                    className="p-2 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] hover:bg-[var(--theme-border)]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-2 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => updateItem(index, "quantity", item.quantity + 1)}
                    className="p-2 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] hover:bg-[var(--theme-border)]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors mt-0.5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="text-sm font-semibold text-blue-500 hover:text-blue-600 px-2 py-1"
            >
              + Add another item
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where will this hardware be kept/used?"
              className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
              Reason for Request
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need this hardware..."
              rows={3}
              className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-[var(--theme-border)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[var(--theme-bg)] text-[var(--theme-text)] rounded-xl font-semibold border border-[var(--theme-border)] hover:bg-[var(--theme-border)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !items.some(i => i.itemType) || !location.trim() || !reason.trim()}
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
      </div>
    </div>
  );
};

export default RequestModal;