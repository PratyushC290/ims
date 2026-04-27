// edited for stock-based catalog
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import { PackagePlus, Search, Loader2, X, Folder as FolderIcon, FolderPlus, ChevronRight, Package, AlertTriangle, History as HistoryIcon, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Pagination from "../components/Pagination";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: "Catalog" }]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [itemHistory, setItemHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);

  const [newItem, setNewItem] = useState({ name: "", category: "", totalQuantity: 0 });
  const [newFolderName, setNewFolderName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFolderId) params.append("folder", currentFolderId);
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
  }, [currentFolderId, searchTerm, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
    setSearchTerm("");
  }, [currentFolderId]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return toast.error("Item name is required");
    if (!newItem.totalQuantity || newItem.totalQuantity <= 0) return toast.error("Quantity must be greater than 0");
    try {
      await api.post("/items", { ...newItem, totalQuantity: Number(newItem.totalQuantity) });
      toast.success("Item added to catalog");
      setIsAddModalOpen(false);
      setNewItem({ name: "", category: "", totalQuantity: 0 });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add item");
    }
  };

  const handleAddFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await api.post("/folders", { name: newFolderName, parent: currentFolderId });
      toast.success("Folder created");
      setIsAddFolderModalOpen(false);
      setNewFolderName("");
      fetchData();
    } catch (error) {
      toast.error("Failed to create folder");
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

  const navigateToBreadcrumb = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    setPage(1);
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

      <div className="bg-[var(--theme-panel)] rounded-2xl shadow-sm border border-[var(--theme-border)] p-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0">
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <button
                  onClick={() => navigateToBreadcrumb(idx)}
                  className={`text-sm font-semibold ${idx === breadcrumbs.length - 1 ? "text-[var(--theme-text)]" : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"}`}
                >
                  {crumb.name}
                </button>
                {idx < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-[var(--theme-border)]" />}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddFolderModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] rounded-xl text-sm font-bold hover:bg-[var(--theme-accent)]/20"
            >
              <FolderPlus className="h-4 w-4" /> New Folder
            </button>
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
                      <button
                        onClick={() => handleViewHistory(item)}
                        className="p-2 hover:bg-[var(--theme-bg)] rounded-lg"
                        title="View History"
                      >
                        <HistoryIcon className="h-4 w-4 text-[var(--theme-text-muted)]" />
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
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-sm w-full p-6 relative border border-[var(--theme-border)]">
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
              <button type="submit" className="w-full py-3 bg-[var(--theme-text)] text-[var(--theme-panel)] rounded-xl font-bold">
                Add Item
              </button>
            </form>
          </div>
        </div>
      )}

      {isAddFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-sm w-full p-6 relative border border-[var(--theme-border)]">
            <button onClick={() => setIsAddFolderModalOpen(false)} className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-4">New Folder</h2>
            <form onSubmit={handleAddFolder} className="space-y-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl"
              />
              <button type="submit" className="w-full py-3 bg-[var(--theme-text)] text-[var(--theme-panel)] rounded-xl font-bold">
                Create Folder
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
    </div>
  );
};

export default Inventory;