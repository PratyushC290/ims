/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import {
  PackagePlus,
  MonitorSmartphone,
  Search,
  Wrench,
  RotateCcw,
  UserPlus,
  Loader2,
  X,
  Folder as FolderIcon,
  FolderPlus,
  ChevronRight,
  MoveRight,
  Users,
  UserMinus,
  CornerUpLeft,
  Settings2,
  Trash2,
  AlertTriangle,
  History as HistoryIcon,
  Upload
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Pagination from "../components/Pagination";

const THEME_PRESETS = [
  { name: "Default Green", bg: "#F8F9F5", panel: "#FFFFFF", text: "#1A1C19", accent: "#8CB881" },
  { name: "Ocean Blue", bg: "#F4F7FB", panel: "#FFFFFF", text: "#111827", accent: "#6366F1" },
  { name: "Dark Mode", bg: "#111827", panel: "#1F2937", text: "#F9FAFB", accent: "#10B981" },
  { name: "Sunset Orange", bg: "#FFFBF7", panel: "#FFFFFF", text: "#271C19", accent: "#F97316" }
];

const Inventory = () => {
  const [folders, setFolders] = useState([]);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Directory State
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: "Root" }]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", action: null, isDestructive: false });

  // Form & Selection States
  const [newItem, setNewItem] = useState({ identifier: "" });
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedItem, setSelectedItem] = useState(null); 
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Return Modal specific
  const [returnImage, setReturnImage] = useState(null);
  
  // History Modal specific
  const [itemHistory, setItemHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination for items
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("app_theme");
    return saved ? JSON.parse(saved) : THEME_PRESETS[0];
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--theme-bg", theme.bg);
    document.documentElement.style.setProperty("--theme-panel", theme.panel);
    document.documentElement.style.setProperty("--theme-text", theme.text);
    document.documentElement.style.setProperty("--theme-accent", theme.accent);
    document.documentElement.style.setProperty("--theme-border", theme.panel === "#FFFFFF" || theme.panel.toUpperCase() === "#FFF" ? "#EBECE7" : "#374151");
    document.documentElement.style.setProperty("--theme-text-muted", theme.panel === "#FFFFFF" || theme.panel.toUpperCase() === "#FFF" ? "#8F968A" : "#9CA3AF");
    localStorage.setItem("app_theme", JSON.stringify(theme));
  }, [theme]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const folderQuery = currentFolderId ? `?parent=${currentFolderId}` : "?parent=";
      const statusQ = statusFilter !== "All" ? `&status=${statusFilter}` : "";
      const itemQuery = `?page=${page}&limit=${limit}&folder=${currentFolderId || "null"}${statusQ}`;
      
      const [foldersRes, itemsRes, usersRes] = await Promise.all([
        api.get(`/folders${folderQuery}`),
        api.get(`/items${itemQuery}`),
        api.get("/users?limit=100")
      ]);

      setFolders(foldersRes.data);
      setItems(itemsRes.data.items);
      setPagination(itemsRes.data.pagination);
      setUsers(usersRes.data.users);
    } catch (error) {
      toast.error("Failed to load directory data");
    } finally {
      setLoading(false);
    }
  }, [page, limit, currentFolderId, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filters
  const filteredItems = items.filter((item) =>
    item.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users
    .filter((u) => u.accountStatus === "Approved")
    .filter((u) =>
      u.fullname.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.instituteEmail.toLowerCase().includes(userSearch.toLowerCase())
    );

  // Directory Navigation
  const navigateToFolder = (folder) => {
    setCurrentFolderId(folder._id);
    setBreadcrumbs([...breadcrumbs, { id: folder._id, name: folder.name }]);
    setPage(1);
    setSearchTerm("");
  };

  const navigateToBreadcrumb = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    setPage(1);
    setSearchTerm("");
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, type, id) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ type, id }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetFolderId) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (!data || !data.type || !data.id) return;
      if (data.type === "folder" && data.id === targetFolderId) return; // Prevent dropping into self
      
      if (data.type === "item") {
        await api.put(`/items/${data.id}/move`, { newFolderId: targetFolderId });
        toast.success("Item moved successfully!");
      } else if (data.type === "folder") {
        await api.put(`/folders/${data.id}`, { parent: targetFolderId });
        toast.success("Folder moved successfully!");
      }
      fetchData();
    } catch (error) {
      toast.error("Failed to move asset");
    }
  };

  // Generic Confirm Trigger
  const showConfirm = (title, message, action, isDestructive = false) => {
    setConfirmModal({ isOpen: true, title, message, action, isDestructive });
  };
  const closeConfirm = () => setConfirmModal({ isOpen: false, title: "", message: "", action: null, isDestructive: false });

  // Create Handlers
  const handleAddFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await api.post("/folders", { name: newFolderName, parent: currentFolderId });
      toast.success("Folder created!");
      setIsAddFolderModalOpen(false);
      setNewFolderName("");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create folder");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await api.post("/items", { ...newItem, folder: currentFolderId });
      toast.success(`Asset ${newItem.identifier} added!`);
      setIsAddModalOpen(false);
      setNewItem({ identifier: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add asset");
    }
  };

  // Assign & Return
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return toast.error("Please select a user.");
    try {
      await api.put(`/items/${selectedItem._id}/assign`, { userId: selectedUserId });
      toast.success(`Asset assigned!`);
      setIsAssignModalOpen(false);
      setSelectedItem(null);
      setSelectedUserId("");
      fetchData();
    } catch (error) {
      toast.error("Failed to assign item");
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/items/${selectedItem._id}/return`, { image: returnImage });
      toast.success("Item returned.");
      setIsReturnModalOpen(false);
      setSelectedItem(null);
      setReturnImage(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to return item");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setReturnImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleMaintenance = async (item) => {
    try {
      await api.put(`/items/${item._id}/maintenance`);
      toast.success("Status updated.");
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // History Fetch
  const openHistory = async (item) => {
    setSelectedItem(item);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/items/${item._id}/history`);
      setItemHistory(res.data.history);
    } catch (e) {
      toast.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Undo Helper
  const displayUndoToast = (message, actionLogId) => {
    toast((t) => (
      <div className="flex items-center gap-4">
        <span>{message}</span>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await api.post(`/items/undo/${actionLogId}`);
              toast.success("Action undone!");
              fetchData();
            } catch(e) {
              toast.error("Failed to undo");
            }
          }}
          className="px-3 py-1 bg-[var(--theme-panel)] text-[var(--theme-text)] border border-[var(--theme-border)] rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1"
        >
          <CornerUpLeft className="h-3 w-3" /> Undo
        </button>
      </div>
    ), { duration: 6000 });
  };

  // Bulk Actions
  const handleBulkAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return toast.error("Please select a user.");
    try {
      const res = await api.post("/items/bulk-assign-folder", { folderId: currentFolderId, userId: selectedUserId });
      displayUndoToast(res.data.message, res.data.actionLogId);
      setIsBulkAssignModalOpen(false);
      setSelectedUserId("");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed bulk assign");
    }
  };

  const handleBulkUnassign = () => {
    if (!currentFolderId) return toast.error("Cannot bulk unassign root.");
    showConfirm(
      "Unassign All Items",
      "Are you sure you want to unassign ALL items in this folder? They will be marked as Available.",
      async () => {
        try {
          const res = await api.post("/items/bulk-unassign-folder", { folderId: currentFolderId });
          displayUndoToast(res.data.message, res.data.actionLogId);
          fetchData();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed bulk unassign");
        }
      },
      true
    );
  };

  // Deletes
  const handleDeleteFolder = (folderId, e) => {
    e.stopPropagation();
    showConfirm(
      "Delete Directory",
      "WARNING: Deleting this directory will PERMANENTLY delete all items and subfolders inside it. This action cannot be undone.",
      async () => {
        try {
          await api.delete(`/folders/${folderId}`);
          toast.success("Folder and its contents deleted");
          fetchData();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete");
        }
      },
      true
    );
  };

  const handleDeleteItem = (itemId) => {
    showConfirm(
      "Delete Item",
      "Are you sure you want to permanently delete this asset from the database?",
      async () => {
        try {
          await api.delete(`/items/${itemId}`);
          toast.success("Item deleted");
          fetchData();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete");
        }
      },
      true
    );
  };

  if (loading && folders.length === 0 && items.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--theme-accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative pb-12 px-4 sm:px-0">
      
      {/* Header & Theme Settings */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 pt-4 pb-4 md:pb-8 relative">
        <button 
          onClick={() => setIsThemeModalOpen(true)}
          className="absolute right-0 top-0 p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] bg-[var(--theme-panel)] rounded-full border border-[var(--theme-border)] shadow-sm transition-all"
        >
          <Settings2 className="h-5 w-5" />
        </button>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] text-xs font-bold tracking-wider uppercase">
          <span className="h-2 w-2 rounded-full bg-[var(--theme-accent)] animate-pulse"></span>
          Inventory Directory
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--theme-text)] tracking-tight">
          Manage Assets,<br/>
          <span className="text-[var(--theme-accent)]">Fast & Easy</span>
        </h1>
      </div>

      {/* Directory Tools & Breadcrumbs */}
      <div 
        className="bg-[var(--theme-panel)] rounded-2xl md:rounded-[2rem] shadow-sm border border-[var(--theme-border)] p-4 md:p-6 space-y-6"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, currentFolderId)}
      >
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar w-full xl:w-auto">
            {breadcrumbs.map((crumb, idx) => (
              <div 
                key={crumb.id || 'root'} 
                className="flex items-center gap-2 whitespace-nowrap"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, crumb.id)}
              >
                <button
                  onClick={() => navigateToBreadcrumb(idx)}
                  className={`text-sm font-semibold transition-colors ${
                    idx === breadcrumbs.length - 1 
                      ? "text-[var(--theme-text)]" 
                      : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                  }`}
                >
                  {crumb.name}
                </button>
                {idx < breadcrumbs.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-[var(--theme-border)]" />
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full xl:w-auto">
            {currentFolderId && (
              <>
                <button onClick={() => setIsBulkAssignModalOpen(true)} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[var(--theme-panel)] text-[var(--theme-text)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold hover:bg-[var(--theme-bg)] transition-colors shadow-sm">
                  <Users className="h-4 w-4" /> <span className="hidden md:inline">Bulk Assign</span>
                </button>
                <button onClick={handleBulkUnassign} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[var(--theme-panel)] text-[var(--theme-text)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold hover:bg-[var(--theme-bg)] transition-colors shadow-sm">
                  <UserMinus className="h-4 w-4" /> <span className="hidden md:inline">Unassign All</span>
                </button>
                <div className="hidden md:block w-px h-6 bg-[var(--theme-border)] mx-1"></div>
              </>
            )}
            <button onClick={() => setIsAddFolderModalOpen(true)} className="flex flex-1 md:flex-none justify-center items-center gap-2 px-4 py-2 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] rounded-xl text-sm font-bold hover:bg-[var(--theme-accent)]/20 transition-colors shadow-sm">
              <FolderPlus className="h-4 w-4" /> New Folder
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="flex flex-1 md:flex-none justify-center items-center gap-2 px-4 py-2 bg-[var(--theme-text)] text-[var(--theme-panel)] rounded-xl text-sm font-bold hover:opacity-80 transition-opacity shadow-sm">
              <PackagePlus className="h-4 w-4" /> Add Asset
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
            <input
              type="text"
              placeholder="Search folders or asset identifiers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]/30 transition-all placeholder:text-[var(--theme-text-muted)]"
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="md:w-48 p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]/30"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>
      </div>

      {/* Folders Grid */}
      {filteredFolders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[var(--theme-text)] flex items-center gap-2">
            Folders <span className="bg-[var(--theme-border)] text-[var(--theme-text-muted)] text-xs py-0.5 px-2 rounded-full">{filteredFolders.length}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredFolders.map(folder => (
              <div 
                key={folder._id} 
                onClick={() => navigateToFolder(folder)}
                draggable
                onDragStart={(e) => handleDragStart(e, "folder", folder._id)}
                onDragOver={handleDragOver}
                onDrop={(e) => { e.stopPropagation(); handleDrop(e, folder._id); }}
                className="group relative bg-[var(--theme-panel)] p-5 rounded-[1.5rem] border border-[var(--theme-border)] shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[var(--theme-accent)]/10 flex items-center justify-center text-[var(--theme-accent)] group-hover:scale-105 transition-transform">
                    <FolderIcon className="h-6 w-6 fill-current opacity-20 absolute" />
                    <FolderIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--theme-text)] text-base">{folder.name}</h4>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDeleteFolder(folder._id, e)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-[var(--theme-text-muted)] hover:text-red-500 transition-all bg-[var(--theme-panel)] rounded-full hover:bg-red-50"
                  title="Delete Folder"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[var(--theme-text)] flex items-center gap-2">
          Items <span className="bg-[var(--theme-border)] text-[var(--theme-text-muted)] text-xs py-0.5 px-2 rounded-full">{pagination?.totalItems || 0}</span>
        </h3>
        
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-[var(--theme-panel)] rounded-[2rem] border border-[var(--theme-border)]">
            <p className="text-[var(--theme-text-muted)] font-medium">No items found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <div 
                key={item._id} 
                draggable
                onDragStart={(e) => handleDragStart(e, "item", item._id)}
                className="bg-[var(--theme-panel)] p-5 rounded-[1.5rem] border border-[var(--theme-border)] shadow-sm flex flex-col gap-4 relative overflow-hidden group cursor-grab active:cursor-grabbing"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  item.status === 'Available' ? 'bg-[#10B981]' : 
                  item.status === 'Assigned' ? 'bg-[#3B82F6]' : 'bg-[#F59E0B]'
                }`}></div>

                <div className="flex justify-between items-start pl-2">
                  <div className="flex gap-3">
                    <div className="mt-1 h-10 w-10 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text)]">
                      <MonitorSmartphone className="h-5 w-5" />
                    </div>
                    <div className="flex items-center">
                      <h4 className="font-mono text-lg font-bold text-[var(--theme-text)] tracking-tight">{item.identifier}</h4>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                      ${item.status === 'Available' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                        item.status === 'Assigned' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'}`}
                    >
                      {item.status}
                    </span>
                    <button 
                      onClick={() => handleDeleteItem(item._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--theme-text-muted)] hover:text-red-500 transition-opacity"
                      title="Delete Item"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="pl-2 flex items-center justify-between mt-2">
                  <div className="text-sm font-medium text-[var(--theme-text-muted)] flex items-center gap-2 max-w-[50%] overflow-hidden">
                    {item.assignedTo ? (
                      <span className="flex items-center gap-1.5 text-[var(--theme-text)] truncate">
                        <div className="h-5 w-5 shrink-0 rounded-full bg-[var(--theme-border)] flex items-center justify-center text-[10px] font-bold">
                          {item.assignedTo.fullname.charAt(0)}
                        </div>
                        <span className="truncate">{item.assignedTo.fullname}</span>
                      </span>
                    ) : (
                      "Unassigned"
                    )}
                  </div>
                  
                  <div className="flex gap-1.5">
                    {item.status === "Available" && (
                      <button onClick={() => { setSelectedItem(item); setIsAssignModalOpen(true); }} className="p-2 bg-[var(--theme-bg)] hover:bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] rounded-lg transition-colors">
                        <UserPlus className="h-4 w-4" />
                      </button>
                    )}
                    {item.status === "Assigned" && (
                      <button onClick={() => { setSelectedItem(item); setIsReturnModalOpen(true); }} className="p-2 bg-[var(--theme-bg)] hover:bg-[#10B981]/10 text-[#10B981] rounded-lg transition-colors">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => handleMaintenance(item)} className="p-2 bg-[var(--theme-bg)] hover:bg-[#F59E0B]/10 text-[#F59E0B] rounded-lg transition-colors">
                      <Wrench className="h-4 w-4" />
                    </button>
                    <button onClick={() => openHistory(item)} className="p-2 bg-[var(--theme-bg)] hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors">
                      <HistoryIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredItems.length > 0 && (
          <div className="mt-4">
             <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} loading={loading} />
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* Custom Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--theme-panel)] rounded-3xl shadow-2xl max-w-sm w-full p-6 relative">
            <div className={`mb-4 inline-flex p-3 rounded-2xl ${confirmModal.isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">{confirmModal.title}</h2>
            <p className="text-sm text-[var(--theme-text-muted)] mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button 
                onClick={closeConfirm} 
                className="flex-1 py-2.5 bg-[var(--theme-bg)] text-[var(--theme-text)] rounded-xl font-bold border border-[var(--theme-border)] hover:bg-[var(--theme-border)]"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmModal.action();
                  closeConfirm();
                }} 
                className={`flex-1 py-2.5 text-white rounded-xl font-bold shadow-sm ${confirmModal.isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Settings Modal with Fully Dynamic Color Pickers */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-sm w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsThemeModalOpen(false)} className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] bg-[var(--theme-bg)] rounded-full border border-[var(--theme-border)]">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-4">Theme Settings</h2>
            
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Presets</h3>
              {THEME_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setTheme(preset)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl border ${theme.name === preset.name ? 'border-[var(--theme-accent)] ring-1 ring-[var(--theme-accent)]' : 'border-[var(--theme-border)]'} bg-[var(--theme-bg)] transition-all`}
                >
                  <div className="flex -space-x-2">
                    <div className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: preset.bg }}></div>
                    <div className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: preset.panel }}></div>
                    <div className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: preset.accent }}></div>
                  </div>
                  <span className="font-semibold text-[var(--theme-text)] text-sm">{preset.name}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4 border-t border-[var(--theme-border)] pt-4">
               <h3 className="text-sm font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Custom Colors</h3>
               
               <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col text-sm font-medium text-[var(--theme-text-muted)]">
                    Background
                    <input type="color" value={theme.bg} onChange={(e) => setTheme({...theme, name: "Custom", bg: e.target.value})} className="mt-1 h-10 w-full rounded-lg cursor-pointer" />
                  </label>
                  <label className="flex flex-col text-sm font-medium text-[var(--theme-text-muted)]">
                    Panel
                    <input type="color" value={theme.panel} onChange={(e) => setTheme({...theme, name: "Custom", panel: e.target.value})} className="mt-1 h-10 w-full rounded-lg cursor-pointer" />
                  </label>
                  <label className="flex flex-col text-sm font-medium text-[var(--theme-text-muted)]">
                    Text
                    <input type="color" value={theme.text} onChange={(e) => setTheme({...theme, name: "Custom", text: e.target.value})} className="mt-1 h-10 w-full rounded-lg cursor-pointer" />
                  </label>
                  <label className="flex flex-col text-sm font-medium text-[var(--theme-text-muted)]">
                    Accent
                    <input type="color" value={theme.accent} onChange={(e) => setTheme({...theme, name: "Custom", accent: e.target.value})} className="mt-1 h-10 w-full rounded-lg cursor-pointer" />
                  </label>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Item History Modal */}
      {isHistoryModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-lg w-full p-6 md:p-8 relative max-h-[90vh] flex flex-col">
            <button onClick={() => setIsHistoryModalOpen(false)} className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">Asset History</h2>
            <p className="font-mono text-sm text-[var(--theme-accent)] mb-6">{selectedItem.identifier}</p>

            <div className="overflow-y-auto pr-2 space-y-6 flex-1">
              {historyLoading ? (
                 <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent)]" /></div>
              ) : itemHistory.length === 0 ? (
                 <p className="text-[var(--theme-text-muted)] text-sm italic">No history found for this item.</p>
              ) : (
                <div className="relative border-l-2 border-[var(--theme-border)] ml-3 space-y-8 pb-4">
                  {itemHistory.map((log) => (
                    <div key={log._id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-[var(--theme-panel)] border-2 border-[var(--theme-accent)]"></div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[var(--theme-text-muted)] mb-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                        <span className="text-sm font-semibold text-[var(--theme-text)] mb-1">
                          {log.action}
                        </span>
                        {log.targetUser && (
                          <span className="text-sm text-[var(--theme-text-muted)]">
                            User: <b>{log.targetUser.fullname}</b>
                          </span>
                        )}
                        <span className="text-xs text-[var(--theme-text-muted)] mt-1">
                          Authorized by: {log.authorizedBy?.fullname}
                        </span>
                        {log.image && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-[var(--theme-border)] max-w-xs">
                            <img src={log.image} alt="Return proof" className="w-full h-auto object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Return Item Modal */}
      {isReturnModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-sm w-full p-6 relative border border-[var(--theme-border)]">
            <button onClick={() => { setIsReturnModalOpen(false); setReturnImage(null); }} className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">Return Asset</h2>
            <p className="font-mono text-sm text-[var(--theme-accent)] mb-4">{selectedItem.identifier}</p>
            
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">Optional Condition Photo</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--theme-border)] rounded-xl cursor-pointer hover:bg-[var(--theme-bg)] transition-colors overflow-hidden relative">
                  {returnImage ? (
                    <img src={returnImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-[var(--theme-text-muted)]">
                      <Upload className="h-6 w-6 mb-2" />
                      <span className="text-xs font-semibold">Click to upload photo</span>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-[var(--theme-text)] text-[var(--theme-panel)] rounded-xl font-bold shadow-sm">Confirm Return</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Folder Modal */}
      {isAddFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-sm w-full p-6 relative border border-[var(--theme-border)]">
            <button onClick={() => setIsAddFolderModalOpen(false)} className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-4">New Folder</h2>
            <form onSubmit={handleAddFolder}>
              <input
                autoFocus
                type="text"
                required
                placeholder="Folder Name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl mb-4 font-medium"
              />
              <button type="submit" className="w-full py-3 bg-[var(--theme-text)] text-[var(--theme-panel)] rounded-xl font-bold hover:opacity-90">
                Create Folder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-sm w-full p-8 relative border border-[var(--theme-border)]">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-6">Add Asset</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <input type="text" required placeholder="Asset ID / Tag" value={newItem.identifier} onChange={(e) => setNewItem({ identifier: e.target.value })} className="w-full p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl font-mono font-bold uppercase" />
              <button type="submit" className="w-full py-3 mt-2 bg-[var(--theme-accent)] text-white rounded-xl font-bold hover:opacity-90">
                Save Asset
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal (Single & Bulk reuse the same layout) */}
      {(isAssignModalOpen || isBulkAssignModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-md w-full p-8 relative border border-[var(--theme-border)]">
            <button onClick={() => { setIsAssignModalOpen(false); setIsBulkAssignModalOpen(false); }} className="absolute top-6 right-6 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-4">
              {isBulkAssignModalOpen ? "Bulk Assign Items" : "Assign Asset"}
            </h2>
            <p className="text-sm text-[var(--theme-text-muted)] mb-4">
              {isBulkAssignModalOpen ? "Select user to receive all available items." : "Select user to assign this item."}
            </p>
            <form onSubmit={isBulkAssignModalOpen ? handleBulkAssignSubmit : handleAssignSubmit} className="space-y-4">
              <input type="text" placeholder="Search user..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-full p-3 bg-[var(--theme-bg)] text-[var(--theme-text)] border border-[var(--theme-border)] rounded-xl font-medium" />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredUsers.map((user) => (
                  <label key={user._id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selectedUserId === user._id ? 'bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]' : 'hover:bg-[var(--theme-bg)] border border-transparent'}`}>
                    <input type="radio" name="user" value={user._id} checked={selectedUserId === user._id} onChange={(e) => setSelectedUserId(e.target.value)} className="hidden" />
                    <div>
                      <div className="font-bold text-sm text-[var(--theme-text)]">{user.fullname}</div>
                      <div className="text-xs text-[var(--theme-text-muted)]">{user.instituteEmail}</div>
                    </div>
                  </label>
                ))}
              </div>
              <button type="submit" className="w-full py-3 bg-[var(--theme-text)] text-[var(--theme-panel)] rounded-xl font-bold shadow-sm">Assign Now</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
