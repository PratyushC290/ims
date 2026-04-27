import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle, Package, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

const FulfillModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [fulfilling, setFulfilling] = useState(false);
  const [hardwareTypes, setHardwareTypes] = useState([]);
  const [fetchingTypes, setFetchingTypes] = useState(true);
  const [items, setItems] = useState([]);
  const [htSearch, setHtSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchHardwareTypes();
      if (request && request.items) {
        setItems(request.items.map(item => ({
          itemType: item.itemType,
          quantity: item.quantity,
          identifiers: Array(item.quantity).fill("")
        })));
      }
    }
  }, [isOpen, request]);

  const fetchHardwareTypes = async () => {
    try {
      setFetchingTypes(true);
      const res = await api.get("/items");
      setHardwareTypes(res.data.items || []);
    } catch (error) {
      console.error("Failed to fetch hardware types");
    } finally {
      setFetchingTypes(false);
    }
  };

  const updateItemQuantity = (index, newQty) => {
    const qty = Math.max(0, parseInt(newQty) || 0);
    const newItems = [...items];
    newItems[index].quantity = qty;
    if (qty === 0) {
      newItems[index].identifiers = [];
    } else {
      newItems[index].identifiers = Array(qty).fill("").map((_, i) => newItems[index].identifiers[i] || "");
    }
    setItems(newItems);
  };

  const updateIdentifier = (itemIndex, idIndex, value) => {
    const newItems = [...items];
    newItems[itemIndex].identifiers[idIndex] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems([...items, { itemType: "", quantity: 1, identifiers: [""] }]);
  };

  const updateItemType = (index, value) => {
    const newItems = [...items];
    newItems[index].itemType = value;
    newItems[index].quantity = 1;
    newItems[index].identifiers = [""];
    setItems(newItems);
    // Clear selection state when user types to show dropdown
    const newSelected = { ...selectedItems };
    delete newSelected[index];
    setSelectedItems(newSelected);
  };

  const handleSelectItemType = (index, item) => {
    const newItems = [...items];
    newItems[index].itemType = item.name;
    newItems[index].quantity = 1;
    newItems[index].identifiers = [""];
    setItems(newItems);
    setSelectedItems({ ...selectedItems, [index]: item });
    setHtSearch("");
  };

  const handleFulfill = async () => {
    const validItems = items.filter(item => item.itemType && item.quantity > 0);
    
    if (validItems.length === 0) {
      toast.error("Please add at least one item to fulfill");
      return;
    }

    const assignments = {};
    const itemsWithId = items.map((item, originalIndex) => {
      if (!item.itemType || item.quantity <= 0) return null;
      
      console.log("Item:", item.itemType, "Identifiers:", item.identifiers, "Count:", item.identifiers.length);
      
      assignments[item.itemType] = item.identifiers;
      
      return {
        itemType: item.itemType,
        quantity: item.quantity,
        itemId: selectedItems[originalIndex]?._id || null
      };
    }).filter(Boolean);

    console.log("Submitting:", { itemsWithId, assignments });

    try {
      setFulfilling(true);
      await api.post(`/requests/${request._id}/fulfill`, { 
        items: itemsWithId,
        assignments 
      });
      toast.success("Request fulfilled successfully!");
      onSuccess();
    } catch (error) {
      console.error("Backend error:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to fulfill request");
    } finally {
      setFulfilling(false);
    }
  };

  if (!isOpen || !request) return null;

  const filteredTypes = hardwareTypes.filter(t => 
    !htSearch || t.name.toLowerCase().includes(htSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[var(--theme-panel)] rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-[var(--theme-border)] animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
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

        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <p className="text-sm text-amber-400 font-medium">Admin Control</p>
          <p className="text-xs text-[var(--theme-text-muted)] mt-1">
            You can modify quantities, add extra items, or leave items out. Enter identifiers or leave blank for auto-generation.
          </p>
        </div>

        <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4 mb-6">
          {items.map((item, idx) => (
            <div key={idx} className="bg-[var(--theme-bg)] rounded-2xl p-4 border border-[var(--theme-border)]">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search hardware type..."
                    value={item.itemType}
                    onChange={(e) => {
                      updateItemType(idx, e.target.value);
                      setHtSearch(e.target.value);
                    }}
                    className="w-full px-3 py-1.5 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] text-sm"
                  />
                  {item.itemType && !selectedItems[idx] && (
                    <div className="mt-1 max-h-32 overflow-y-auto border border-[var(--theme-border)] rounded-lg">
                      {filteredTypes.length > 0 ? (
                        filteredTypes.map(t => (
                          <div
                            key={t._id}
                            onClick={() => handleSelectItemType(idx, t)}
                            className={`p-2 cursor-pointer hover:bg-[var(--theme-panel)] border-b border-[var(--theme-border)] last:border-0 text-sm flex justify-between ${
                              item.itemType === t.name ? "bg-blue-500/10" : ""
                            }`}
                          >
                            <span>{t.name}</span>
                            <span className={t.availableQuantity > 0 ? "text-green-500" : "text-red-500"}>
                              {t.availableQuantity} avail
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-[var(--theme-text-muted)]">No matches</div>
                      )}
                    </div>
                  )}
                  {selectedItems[idx] && (
                    <div className="mt-1 flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-400">{selectedItems[idx].name}</span>
                      <span className="text-xs text-[var(--theme-text-muted)]">({selectedItems[idx].availableQuantity} avail)</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newSelected = { ...selectedItems };
                          delete newSelected[idx];
                          setSelectedItems(newSelected);
                          setItems(items.map((item, i) => i === idx ? { ...item, itemType: "" } : item));
                        }}
                        className="ml-auto p-1 text-blue-500 hover:bg-blue-500/20 rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateItemQuantity(idx, item.quantity - 1)}
                    className="p-1.5 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] hover:bg-[var(--theme-border)]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateItemQuantity(idx, e.target.value)}
                    className="w-16 px-2 py-1.5 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] text-center text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => updateItemQuantity(idx, item.quantity + 1)}
                    className="p-1.5 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] hover:bg-[var(--theme-border)]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {item.quantity > 0 && (
                <div className="pt-2 border-t border-[var(--theme-border)]">
                  <label className="block text-xs font-medium text-[var(--theme-text-muted)] mb-1">
                    Serial Numbers (required)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {item.identifiers.map((identifier, i) => (
                      <input
                        key={i}
                        type="text"
                        placeholder={`Serial #${i + 1}`}
                        value={identifier}
                        onChange={(e) => updateIdentifier(idx, i, e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] text-sm"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addItem}
            className="w-full py-3 border-2 border-dashed border-[var(--theme-border)] rounded-xl text-[var(--theme-text-muted)] hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="h-5 w-5" />
            Add Another Item
          </button>
        </div>

        <div className="flex gap-3 pt-2 border-t border-[var(--theme-border)]">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[var(--theme-bg)] text-[var(--theme-text)] rounded-xl font-semibold border border-[var(--theme-border)] hover:bg-[var(--theme-border)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleFulfill}
            disabled={fulfilling}
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