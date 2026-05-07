// edited for stock-based catalog
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import { PackagePlus, Search, Loader2, X, Package, AlertTriangle, History as HistoryIcon, Plus, Edit2, CheckCircle, Eye, FileText } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Pagination from "../components/Pagination";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [issuedAssets, setIssuedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("catalog");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [itemHistory, setItemHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [users, setUsers] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);

  const [newItem, setNewItem] = useState({ name: "", category: "", totalQuantity: 0, document: null });
  const [editItem, setEditItem] = useState({ name: "", category: "", totalQuantity: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [assignForm, setAssignForm] = useState({
    userId: "",
    userName: "",
  });
  const [assignItems, setAssignItems] = useState([
    { hardwareType: "", quantity: 1, identifiers: [""] }
  ]);
  const [assignItemsSelected, setAssignItemsSelected] = useState([{}]);
  const [assignUserSearch, setAssignUserSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", page);
      params.append("limit", 20);

      const response = await api.get(`/items?${params.toString()}`);
      setItems(response.data.items || []);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
    setSearchTerm("");
  }, [activeTab]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return toast.error("Item name is required");
    if (!newItem.totalQuantity || newItem.totalQuantity <= 0) return toast.error("Quantity must be greater than 0");
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("category", newItem.category);
      formData.append("totalQuantity", Number(newItem.totalQuantity));
      if (newItem.document) {
        formData.append("document", newItem.document);
      }

      await api.post("/items", formData);
      toast.success("Item added to catalog");
      setIsAddModalOpen(false);
      setNewItem({ name: "", category: "", totalQuantity: 0, document: null });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add item");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/items/${itemId}`);
      toast.success("Item deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleViewHistory = async (item) => {
    setSelectedItem(item);
    setIsHistoryModalOpen(true);
    try {
      const res = await api.get(`/items/${item._id}/history`);
      setItemHistory(res.data.history || []);
    } catch (error) {
      setItemHistory([]);
    }
  };

  const handleReturnAsset = async (issuedAsset) => {
    if (!confirm(`Return ${issuedAsset.identifier}?`)) return;
    try {
      await api.put(`/items/return/${issuedAsset._id}`);
      toast.success("Item returned successfully");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to return item");
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setEditItem({
      name: item.name,
      category: item.category || "",
      totalQuantity: item.totalQuantity || 0
    });
    setIsEditModalOpen(true);
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/items/${selectedItem._id}`, {
        name: editItem.name,
        category: editItem.category,
        totalQuantity: editItem.totalQuantity
      });
      toast.success("Item updated successfully");
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update item");
    }
  };

  const openAssignModal = async () => {
    setIsAssignModalOpen(true);
    try {
      const [usersRes, itemsRes] = await Promise.all([
        api.get("/users"),
        api.get("/items")
      ]);
      setUsers(usersRes.data.users || []);
      setCatalogItems(itemsRes.data.items || []);
    } catch (error) {
      toast.error("Failed to load data");
    }
  };

  const handleAssignItem = async (e) => {
    e.preventDefault();
    
    if (!assignForm.userId) {
      toast.error("Please select a user");
      return;
    }

    // Debug what's in the state
    console.log("assignItems state:", JSON.stringify(assignItems));

    // Simple direct submit - just gather all valid items
    const itemsToSubmit = [];
    for (let i = 0; i < assignItems.length; i++) {
      const item = assignItems[i];
      const qty = parseInt(item.quantity) || 0;
      const idLen = item.identifiers?.length || 0;
      console.log(`Item ${i}: hw=${item.hardwareType}, qty=${qty} (type:${typeof qty}), ids=${idLen}`);
      
      if (item.hardwareType && qty > 0) {
        if (idLen < qty) {
          toast.error(`${item.hardwareType}: need ${qty} identifier(s), got ${idLen}`);
          return;
        }
        
        itemsToSubmit.push({
          hardwareType: item.hardwareType,
          quantity: qty,
          identifiers: item.identifiers.slice(0, qty),
          itemId: assignItemsSelected[i]?._id || null
        });
      }
    }

    if (itemsToSubmit.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    console.log("FINAL SUBMIT:", itemsToSubmit);

    try {
      await api.post("/items/assign", {
        userId: assignForm.userId,
        items: itemsToSubmit
      });
      toast.success("Items assigned successfully");
      setIsAssignModalOpen(false);
      setAssignForm({ userId: "", userName: "" });
      setAssignItems([{ hardwareType: "", quantity: 1, identifiers: [""] }]);
      setAssignItemsSelected([{}]);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign item");
    }
  };

  const addAssignItem = () => {
    setAssignItems([...assignItems, { hardwareType: "", quantity: 1, identifiers: [""] }]);
    setAssignItemsSelected([...assignItemsSelected, {}]);
  };

  const removeAssignItem = (index) => {
    if (assignItems.length > 1) {
      setAssignItems(assignItems.filter((_, i) => i !== index));
      setAssignItemsSelected(assignItemsSelected.filter((_, i) => i !== index));
    }
  };

  const updateAssignItem = (index, field, value) => {
    const newItems = [...assignItems];
    newItems[index][field] = value;
    if (field === "quantity") {
      const qty = Math.max(1, parseInt(value) || 1);
      newItems[index].identifiers = Array(qty).fill("").map((_, i) => newItems[index].identifiers[i] || "");
    }
    setAssignItems(newItems);
    // Clear selection state when user types
    if (field === "hardwareType") {
      const newSelected = [...assignItemsSelected];
      newSelected[index] = {};
      setAssignItemsSelected(newSelected);
    }
  };

  const handleSelectAssignItem = (index, item) => {
    const newItems = [...assignItems];
    const currentQty = newItems[index].quantity || 1;
    const existingIds = newItems[index].identifiers || [];
    newItems[index].hardwareType = item.name;
    newItems[index].quantity = currentQty;
    newItems[index].identifiers = Array(currentQty).fill("").map((_, i) => existingIds[i] || "");
    const newSelected = [...assignItemsSelected];
    newSelected[index] = item;
    setAssignItems(newItems);
    setAssignItemsSelected(newSelected);
  };

  const updateAssignIdentifier = (itemIndex, idIndex, value) => {
    const newItems = [...assignItems];
    newItems[itemIndex].identifiers[idIndex] = value;
    setAssignItems(newItems);
  };

  if (loading && items.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center text-center space-y-4 pt-4">
        <h1 className="text-4xl font-extrabold text-[var(--theme-text)]">
          Inventory <span className="text-[var(--theme-accent)]">Catalog</span>
        </h1>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-2 p-1 bg-[var(--theme-bg)] rounded-xl border border-[var(--theme-border)]">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "catalog"
                ? "bg-[var(--theme-panel)] text-[var(--theme-text)] shadow-sm"
                : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
            }`}
          >
            <Package className="h-4 w-4" />
            Catalog
          </button>
        </div>
        <button
          onClick={openAssignModal}
          className="ml-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          Assign Item
        </button>
</div>

      <div className="bg-[var(--theme-panel)] rounded-2xl shadow-sm border border-[var(--theme-border)] p-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--theme-text)]">Catalog</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--theme-text)] text-[var(--theme-panel)] rounded-xl text-sm font-bold hover:opacity-80"
            >
              <PackagePlus className="h-4 w-4" /> Add Item
            </button>
          </div>
        </div>

        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text-muted)]" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)]"
          />
        </div>
      </div>

      <div className="bg-[var(--theme-panel)] rounded-2xl shadow-sm border border-[var(--theme-border)] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--theme-border)] bg-[var(--theme-bg)]">
              <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)]">Asset Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)]">Category</th>
              <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)]">Total Qty</th>
              <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)]">Available</th>
              <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--theme-border)]">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[var(--theme-text-muted)]">
                  No items in catalog. Add your first item!
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="hover:bg-[var(--theme-bg)]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--theme-bg)] flex items-center justify-center">
                        <Package className="h-5 w-5 text-[var(--theme-text-muted)]" />
                      </div>
                      <span className="font-medium text-[var(--theme-text)]">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--theme-text-muted)]">
                    {item.category || "General"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-[var(--theme-text)]">{item.totalQuantity}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${item.availableQuantity > 0 ? "text-green-500" : "text-red-500"}`}>
                      {item.availableQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {item.documentUrl && (
                        <a
                          href={`http://localhost:3000${item.documentUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-[var(--theme-bg)] rounded-lg"
                          title="View Document"
                        >
                          <Eye className="h-4 w-4 text-purple-500" />
                        </a>
                      )}
                      <button
                        onClick={() => handleViewHistory(item)}
                        className="p-2 hover:bg-[var(--theme-bg)] rounded-lg"
                        title="View History"
                      >
                        <HistoryIcon className="h-4 w-4 text-[var(--theme-text-muted)]" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 hover:bg-[var(--theme-bg)] rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg"
                        title="Delete"
                      >
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination pagination={pagination} onPageChange={setPage} loading={loading} />
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-lg w-full p-6 relative border border-[var(--theme-border)]">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-4">Add to Catalog</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">Item Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Dell Laptop"
                  className="w-full p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">Category</label>
                <input
                  type="text"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  placeholder="e.g. Electronics"
                  className="w-full p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">Initial Quantity</label>
                <input
                  type="number"
                  value={newItem.totalQuantity}
                  onChange={(e) => setNewItem({ ...newItem, totalQuantity: e.target.value })}
                  placeholder="0"
                  min="0"
                  className="w-full p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">
                  <FileText className="inline-block h-4 w-4 mr-1" /> Document/PDF (Optional)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setNewItem({ ...newItem, document: e.target.files[0] })}
                  className="w-full p-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-[var(--theme-text)] text-[var(--theme-panel)] rounded-xl font-bold">
                Add Item
              </button>
            </form>
          </div>
        </div>
      )}

      {isHistoryModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <button onClick={() => setIsHistoryModalOpen(false)} className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">{selectedItem.name}</h2>
            <p className="text-sm text-[var(--theme-text-muted)] mb-4">History</p>
            <div className="space-y-3">
              {itemHistory.length === 0 ? (
                <p className="text-[var(--theme-text-muted)]">No history yet.</p>
              ) : (
                itemHistory.map((record) => (
                  <div key={record._id} className="p-3 bg-[var(--theme-bg)] rounded-xl">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`font-medium ${record.status === "Issued" ? "text-green-500" : "text-blue-500"}`}>
                        {record.status}
                      </span>
                      <span className="text-[var(--theme-text-muted)]">-</span>
                      <span className="text-[var(--theme-text)]">{record.identifier}</span>
                    </div>
                    {record.user && (
                      <p className="text-sm text-[var(--theme-text-muted)]">{record.user.fullname}</p>
                    )}
                    <p className="text-xs text-[var(--theme-text-muted)]">
                      {new Date(record.issuedAt || record.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-2xl w-full p-6 relative border border-[var(--theme-border)] max-h-[85vh] overflow-y-auto">
            <button onClick={() => setIsAssignModalOpen(false)} className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-4">Assign Items to User</h2>
            <form onSubmit={handleAssignItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">Select User</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={assignUserSearch}
                    onChange={(e) => setAssignUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl"
                  />
                </div>
                <div className="mt-2 max-h-32 overflow-y-auto border border-[var(--theme-border)] rounded-xl">
                  {users.filter(u => 
                    !assignUserSearch || 
                    u.fullname.toLowerCase().includes(assignUserSearch.toLowerCase()) ||
                    u.instituteEmail.toLowerCase().includes(assignUserSearch.toLowerCase())
                  ).length === 0 ? (
                    <div className="p-3 text-sm text-[var(--theme-text-muted)]">No users found</div>
                  ) : (
                    users.filter(u => 
                      !assignUserSearch || 
                      u.fullname.toLowerCase().includes(assignUserSearch.toLowerCase()) ||
                      u.instituteEmail.toLowerCase().includes(assignUserSearch.toLowerCase())
                    ).slice(0, 5).map((user) => (
                      <div
                        key={user._id}
                        onClick={() => {
                          setAssignForm({ ...assignForm, userId: user._id, userName: user.fullname });
                          setAssignUserSearch(user.fullname);
                        }}
                        className={`p-3 cursor-pointer hover:bg-[var(--theme-bg)] border-b border-[var(--theme-border)] last:border-0 ${
                          assignForm.userId === user._id ? "bg-blue-500/10" : ""
                        }`}
                      >
                        <div className="font-medium text-[var(--theme-text)]">{user.fullname}</div>
                        <div className="text-xs text-[var(--theme-text-muted)]">{user.instituteEmail}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-[var(--theme-text-muted)]">Hardware Items</label>
                {assignItems.map((item, index) => (
                  <div key={index} className="bg-[var(--theme-bg)] rounded-xl p-3 border border-[var(--theme-border)]">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text-muted)]" />
                          <input
                            type="text"
                            placeholder="Search hardware type..."
                            value={item.hardwareType}
                            onChange={(e) => updateAssignItem(index, "hardwareType", e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[var(--theme-panel)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm"
                          />
                        </div>
                        {!assignItemsSelected[index]?._id && (
                          <div className="max-h-32 overflow-y-auto border border-[var(--theme-border)] rounded-lg">
                            {catalogItems.filter(i => 
                              !item.hardwareType || 
                              i.name.toLowerCase().includes(item.hardwareType.toLowerCase())
                            ).map((catItem) => (
                              <div
                                key={catItem._id}
                                onClick={() => handleSelectAssignItem(index, catItem)}
                                className={`p-2 cursor-pointer hover:bg-[var(--theme-panel)] border-b border-[var(--theme-border)] last:border-0 flex justify-between ${
                                  item.hardwareType === catItem.name ? "bg-blue-500/10" : ""
                                }`}
                              >
                                <span className="font-medium text-[var(--theme-text)] text-sm">{catItem.name}</span>
                                <span className={`text-xs ${catItem.availableQuantity > 0 ? "text-green-500" : "text-red-500"}`}>
                                  {catItem.availableQuantity} avail
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {assignItemsSelected[index]?._id && (
                          <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-400">{assignItemsSelected[index].name}</span>
                            <span className="text-xs text-[var(--theme-text-muted)]">({assignItemsSelected[index].availableQuantity} avail)</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newSelected = [...assignItemsSelected];
                                newSelected[index] = {};
                                setAssignItemsSelected(newSelected);
                              }}
                              className="ml-auto p-1 text-green-500 hover:bg-green-500/20 rounded"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateAssignItem(index, "quantity", e.target.value)}
                          className="w-full px-2 py-2 bg-[var(--theme-panel)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm text-center"
                          placeholder="Qty"
                        />
                      </div>
                      {assignItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAssignItem(index)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-[var(--theme-border)]">
                      <label className="block text-xs font-medium text-[var(--theme-text-muted)] mb-1">
                        Serial Numbers (required)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {item.identifiers.map((id, idIndex) => (
                        <input
                          key={idIndex}
                          type="text"
                          placeholder={`Serial #${idIndex + 1}`}
                          value={id}
                          onChange={(e) => updateAssignIdentifier(index, idIndex, e.target.value)}
                          className="w-full px-3 py-1.5 bg-[var(--theme-panel)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-lg text-sm"
                        />
                      ))}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAssignItem}
                  className="text-sm font-semibold text-blue-500 hover:text-blue-600 px-2 py-1"
                >
                  + Add another item
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 py-3 bg-[var(--theme-bg)] text-[var(--theme-text)] rounded-xl font-semibold border border-[var(--theme-border)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold"
                >
                  Assign All
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-lg w-full p-6 relative border border-[var(--theme-border)]">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-4">Edit Item</h2>
            <form onSubmit={handleEditItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">Item Name</label>
                <input
                  type="text"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  className="w-full p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">Category</label>
                <input
                  type="text"
                  value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                  className="w-full p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">Total Quantity</label>
                <input
                  type="number"
                  value={editItem.totalQuantity}
                  onChange={(e) => setEditItem({ ...editItem, totalQuantity: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 bg-[var(--theme-bg)] text-[var(--theme-text)] rounded-xl font-semibold border border-[var(--theme-border)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;