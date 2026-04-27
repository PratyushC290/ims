// edited by abhiram parupudi 2401cs21
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  PackagePlus, MonitorSmartphone, Search, Wrench, RotateCcw,
  UserPlus, Loader2, X, Folder as FolderIcon, FolderPlus,
  ChevronRight, Users, UserMinus, CornerUpLeft, Trash2, 
  AlertTriangle, History as HistoryIcon, Upload, Moon, Sun, MessageSquareText, Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Pagination from "../components/Pagination";

const Inventory = () => {
  const [folders, setFolders] = useState([]);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: "Root" }]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", action: null, isDestructive: false });

  const [newItem, setNewItem] = useState({ identifier: "", name: "" });
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedItem, setSelectedItem] = useState(null); 
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [returnImagePreview, setReturnImagePreview] = useState(null);
  const [returnImageFile, setReturnImageFile] = useState(null);
  const [assignImagePreview, setAssignImagePreview] = useState(null);
  const [assignImageFile, setAssignImageFile] = useState(null);
  const [maintenanceImagePreview, setMaintenanceImagePreview] = useState(null);
  const [maintenanceImageFile, setMaintenanceImageFile] = useState(null);
  const [addAssetImagePreview, setAddAssetImagePreview] = useState(null);
  const [addAssetImageFile, setAddAssetImageFile] = useState(null);

  const [assignNotes, setAssignNotes] = useState("");
  const [returnNotes, setReturnNotes] = useState("");
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  
  const [itemHistory, setItemHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [filterEmailInput, setFilterEmailInput] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterEmail(filterEmailInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterEmailInput]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const searchQ = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : "";
      const folderQuery = currentFolderId ? `?parent=${currentFolderId}` : "?parent=";
      const statusQ = statusFilter !== "All" ? `&status=${statusFilter}` : "";
      const emailQ = filterEmail ? `&userEmail=${encodeURIComponent(filterEmail)}` : "";
      
      // If there's a search term, we might want to search globally instead of just in the current folder.
      // But we still pass folder in the URL, the backend will handle if search overrides it.
      const itemQuery = `?page=${page}&limit=${limit}&folder=${currentFolderId || "null"}${statusQ}${emailQ}${searchQ}`;
      
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
      toast.error("failed to load data");
    } finally {
      setLoading(false);
    }
  }, [page, limit, currentFolderId, statusFilter, filterEmail, debouncedSearch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (filterEmail && users.length > 0) {
      const user = users.find(u => u.instituteEmail.toLowerCase().includes(filterEmail.toLowerCase()));
      setSearchedUser(user || null);
    } else {
      setSearchedUser(null);
    }
  }, [filterEmail, users]);

  const filteredItems = useMemo(() => items.filter((item) => item.identifier.toLowerCase().includes(searchTerm.toLowerCase()) || (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase()))), [items, searchTerm]);
  const filteredFolders = useMemo(() => folders.filter((folder) => folder.name.toLowerCase().includes(searchTerm.toLowerCase())), [folders, searchTerm]);
  const filteredUsers = useMemo(() => users.filter((u) => u.accountStatus === "Approved").filter((u) => u.fullname.toLowerCase().includes(userSearch.toLowerCase()) || u.instituteEmail.toLowerCase().includes(userSearch.toLowerCase())), [users, userSearch]);

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

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData("itemId", item._id);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e, targetFolderId) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("itemId");
    if (!itemId) return;

    try {
      await api.put(`/items/${itemId}/move`, { newFolderId: targetFolderId });
      toast.success("Item moved successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to move item");
    }
  };

  const showConfirm = (title, message, action, isDestructive = false) => setConfirmModal({ isOpen: true, title, message, action, isDestructive });
  const closeConfirm = () => setConfirmModal({ isOpen: false, title: "", message: "", action: null, isDestructive: false });

  const handleAddFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await api.post("/folders", { name: newFolderName, parent: currentFolderId });
      toast.success("folder created");
      setIsAddFolderModalOpen(false);
      setNewFolderName("");
      fetchData();
    } catch (error) {
      toast.error("failed to create folder");
    }
  };

  // --- TWO STEP ARCHITECTURE ---
  const uploadImageFirst = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post("/items/upload", formData);
    return res.data.url; // returns the cloudinary url
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.identifier.trim()) return toast.error("asset identifier is required");
    try {
      const uploadedUrl = await uploadImageFirst(addAssetImageFile);
      await api.post("/items", { ...newItem, folder: currentFolderId, image: uploadedUrl });
      toast.success(`asset added`);
      setIsAddModalOpen(false);
      setNewItem({ identifier: "", name: "" });
      setAddAssetImageFile(null);
      setAddAssetImagePreview(null);
      fetchData();
    } catch (error) {
      toast.error("failed to add asset");
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId && !isBulkAssignModalOpen) return toast.error("select a user.");
    try {
      const uploadedUrl = await uploadImageFirst(assignImageFile);
      const res = await api.put(`/items/${selectedItem._id}/assign`, {
        userId: selectedUserId,
        notes: assignNotes,
        image: uploadedUrl // sending just the url string
      });
      toast.success(`asset assigned`);
      setIsAssignModalOpen(false);
      
      // Local state update
      const assignedUser = users.find(u => u._id === selectedUserId);
      setItems(prev => {
        if (statusFilter === "Available") {
          return prev.filter(item => item._id !== selectedItem._id);
        }
        return prev.map(item => item._id === selectedItem._id ? { ...item, status: "Assigned", assignedTo: assignedUser } : item);
      });
      
      setSelectedItem(null);
      setSelectedUserId("");
      setAssignNotes("");
      setAssignImageFile(null);
      setAssignImagePreview(null);
    } catch (error) {
      toast.error("failed to assign");
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      const uploadedUrl = await uploadImageFirst(returnImageFile);
      const res = await api.put(`/items/${selectedItem._id}/return`, {
        notes: returnNotes,
        image: uploadedUrl // sending just the url string
      });
      toast.success("returned");
      setIsReturnModalOpen(false);
      
      // Local state update
      setItems(prev => {
        if (filterEmail || statusFilter === "Assigned") {
          return prev.filter(item => item._id !== selectedItem._id);
        }
        return prev.map(item => item._id === selectedItem._id ? { ...item, status: "Available", assignedTo: null } : item);
      });

      setSelectedItem(null);
      setReturnNotes("");
      setReturnImageFile(null);
      setReturnImagePreview(null);
    } catch (error) {
      toast.error("failed to return");
    }
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const uploadedUrl = await uploadImageFirst(maintenanceImageFile);
      const res = await api.put(`/items/${selectedItem._id}/maintenance`, {
        notes: maintenanceNotes,
        image: uploadedUrl // sending just the url string
      });
      toast.success("updated");
      setIsMaintenanceModalOpen(false);
      
      // Local state update
      const newStatus = selectedItem.status === "Under Maintenance" ? "Available" : "Under Maintenance";
      setItems(prev => {
        if (filterEmail && newStatus === "Under Maintenance") {
          return prev.filter(item => item._id !== selectedItem._id);
        }
        if (statusFilter !== "All" && statusFilter !== newStatus) {
          return prev.filter(item => item._id !== selectedItem._id);
        }
        return prev.map(item => item._id === selectedItem._id ? { ...item, status: newStatus, assignedTo: newStatus === "Under Maintenance" ? null : item.assignedTo } : item);
      });

      setSelectedItem(null);
      setMaintenanceNotes("");
      setMaintenanceImageFile(null);
      setMaintenanceImagePreview(null);
    } catch (error) {
      toast.error("failed to update");
    }
  };

  const handleImageSelect = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file); // storing the raw file for FormData later
    setPreview(URL.createObjectURL(file)); // storing a local temp url for UI display
  };

  const openHistory = async (item) => {
    setSelectedItem(item);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/items/${item._id}/history`);
      setItemHistory(res.data.history);
    } catch (e) {
      toast.error("failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleBulkAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return toast.error("Please select a user.");
    try {
      await api.post("/items/bulk-assign-folder", { folderId: currentFolderId, userId: selectedUserId });
      toast.success("Bulk assigned items.");
      setIsBulkAssignModalOpen(false);
      setSelectedUserId("");
      fetchData();
    } catch (error) {
      toast.error("Failed bulk assign");
    }
  };

  const handleBulkUnassign = () => {
    if (!currentFolderId) return toast.error("Cannot bulk unassign root.");
    showConfirm(
      "Unassign All Items",
      "Are you sure you want to unassign ALL items in this folder?",
      async () => {
        try {
          await api.post("/items/bulk-unassign-folder", { folderId: currentFolderId });
          toast.success("Items unassigned.");
          fetchData();
        } catch (error) {
          toast.error("Failed bulk unassign");
        }
      },
      true
    );
  };

  const handleDeleteFolder = (folderId, e) => {
    e.stopPropagation();
    showConfirm("Delete Directory", "WARNING: Deleting this directory will PERMANENTLY delete all items inside it.", async () => {
      try {
        await api.delete(`/folders/${folderId}`);
        toast.success("Folder deleted");
        fetchData();
      } catch (error) { toast.error("Failed to delete"); }
    }, true);
  };

  const handleDeleteItem = (itemId) => {
    showConfirm("Delete Item", "Are you sure you want to permanently delete this asset?", async () => {
      try {
        await api.delete(`/items/${itemId}`);
        toast.success("Item deleted");
        fetchData();
      } catch (error) { toast.error("Failed to delete"); }
    }, true);
  };

  if (loading && folders.length === 0 && items.length === 0) return <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-[var(--theme-accent)]" /></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative pb-12 px-4 sm:px-0">
      <div className="flex flex-col items-center justify-center text-center space-y-4 pt-4 pb-4 md:pb-8 relative">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] text-xs font-bold tracking-wider uppercase">
          <span className="h-2 w-2 rounded-full bg-[var(--theme-accent)] animate-pulse"></span>
          inventory directory
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--theme-text)] tracking-tight">
          manage assets,<br/><span className="text-[var(--theme-accent)]">fast & easy</span>
        </h1>
      </div>

      <div className="bg-[var(--theme-panel)] rounded-2xl md:rounded-[2rem] shadow-sm border border-[var(--theme-border)] p-4 md:p-6 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar w-full xl:w-auto">
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.id || 'root'} className="flex items-center gap-2 whitespace-nowrap" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, crumb.id)}>
                <button onClick={() => navigateToBreadcrumb(idx)} className={`text-sm font-semibold transition-colors ${idx === breadcrumbs.length - 1 ? "text-[var(--theme-text)]" : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"}`}>{crumb.name}</button>
                {idx < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-[var(--theme-border)]" />}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full xl:w-auto">
            <button onClick={() => setIsAddFolderModalOpen(true)} className="flex flex-1 md:flex-none justify-center items-center gap-2 px-4 py-2 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] rounded-xl text-sm font-bold hover:bg-[var(--theme-accent)]/20 transition-colors shadow-sm"><FolderPlus className="h-4 w-4" /> new folder</button>
            <button onClick={() => setIsAddModalOpen(true)} className="flex flex-1 md:flex-none justify-center items-center gap-2 px-4 py-2 bg-[var(--theme-text)] text-[var(--theme-panel)] rounded-xl text-sm font-bold hover:opacity-80 transition-opacity shadow-sm"><PackagePlus className="h-4 w-4" /> add asset</button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
            <input type="text" placeholder="search asset..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm font-medium focus:outline-none" />
          </div>
          <div className="relative flex-1">
            <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
              <input 
              type="text" 
              placeholder="filter by user email..." 
              value={filterEmailInput} 
              onChange={(e) => {
                setFilterEmailInput(e.target.value);
              }} 
              className="w-full pl-11 pr-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm font-medium focus:outline-none" 
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="md:w-48 p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl font-medium text-sm focus:outline-none">
            <option value="All">all statuses</option>
            <option value="Available">available</option>
            <option value="Assigned">assigned</option>
            <option value="Under Maintenance">maintenance</option>
          </select>
        </div>
      </div>

      {searchedUser && filterEmail && (
        <div className="bg-[var(--theme-panel)] rounded-2xl md:rounded-[2rem] shadow-sm border border-[var(--theme-border)] p-4 md:p-6 flex items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--theme-accent)]/5 rounded-bl-full -z-10"></div>
          <div className="relative">
             <div className="absolute inset-0 bg-[var(--theme-accent)]/20 rounded-full blur-xl"></div>
             <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-[3px] border-[var(--theme-bg)] shadow-md bg-[var(--theme-accent)] flex items-center justify-center text-[var(--theme-panel)] text-2xl md:text-4xl font-extrabold uppercase">
                {searchedUser.fullname.charAt(0)}
             </div>
          </div>
          <div className="flex-1">
             <h2 className="text-xl md:text-2xl font-bold text-[var(--theme-text)]">{searchedUser.fullname}</h2>
             <p className="text-sm font-medium text-[var(--theme-text-muted)] flex items-center gap-2 mt-1">
               <span className="truncate">{searchedUser.instituteEmail}</span>
             </p>
             <div className="flex items-center gap-3 mt-3">
               <span className="px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold text-[var(--theme-accent)] bg-[var(--theme-accent)]/10 uppercase tracking-widest">{searchedUser.role}</span>
               <span className="px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold text-[#10B981] bg-[#10B981]/10 uppercase tracking-widest">{searchedUser.phoneNumber}</span>
             </div>
          </div>
        </div>
      )}

      {filteredFolders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[var(--theme-text)] flex items-center gap-2">folders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredFolders.map(folder => (
              <div key={folder._id} onClick={() => navigateToFolder(folder)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, folder._id)} className="group relative bg-[var(--theme-panel)] p-5 rounded-[1.5rem] border border-[var(--theme-border)] shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[var(--theme-accent)]/10 flex items-center justify-center text-[var(--theme-accent)]"><FolderIcon className="h-6 w-6" /></div>
                  <h4 className="font-bold text-[var(--theme-text)] text-base">{folder.name}</h4>
                </div>
                <button onClick={(e) => handleDeleteFolder(folder._id, e)} className="opacity-0 group-hover:opacity-100 p-2 text-[var(--theme-text-muted)] hover:text-red-500 transition-all bg-[var(--theme-panel)] rounded-full"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[var(--theme-text)] flex items-center gap-2">items</h3>
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-[var(--theme-panel)] rounded-[2rem] border border-[var(--theme-border)]"><p className="text-[var(--theme-text-muted)] font-medium">no items.</p></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <div key={item._id} draggable onDragStart={(e) => handleDragStart(e, item)} className="bg-[var(--theme-panel)] p-5 rounded-[1.5rem] border border-[var(--theme-border)] shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer" onClick={() => openHistory(item)}>
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.status === 'Available' ? 'bg-[#10B981]' : item.status === 'Assigned' ? 'bg-[#3B82F6]' : 'bg-[#F59E0B]'}`}></div>
                <div className="flex justify-between items-start pl-2">
                  <div className="flex gap-3">
                    <div className="mt-1 h-10 w-10 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text)]"><MonitorSmartphone className="h-5 w-5" /></div>
                    <div className="flex flex-col">
                      <h4 className="text-lg font-bold text-[var(--theme-text)] tracking-tight">{item.name || "Unnamed Asset"}</h4>
                      <span className="font-mono text-xs font-semibold text-[var(--theme-text-muted)]">{item.identifier}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.status === 'Available' ? 'bg-[#10B981]/10 text-[#10B981]' : item.status === 'Assigned' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>{item.status}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item._id); }} className="opacity-0 group-hover:opacity-100 p-1 text-[var(--theme-text-muted)] hover:text-red-500 transition-opacity"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
                <div className="pl-2 flex items-center justify-between mt-2">
                  <div className="text-sm font-medium text-[var(--theme-text-muted)] flex items-center gap-2 max-w-[50%] overflow-hidden">{item.assignedTo ? <span className="truncate">{item.assignedTo.fullname}</span> : "unassigned"}</div>
                  <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {item.currentImage && <button onClick={() => { setViewingImage(item.currentImage); setIsImageViewerOpen(true); }} className="p-2 bg-[var(--theme-bg)] hover:bg-purple-500/10 text-purple-500 rounded-lg"><ImageIcon className="h-4 w-4" /></button>}
                    {item.status === "Available" && <button onClick={() => { setSelectedItem(item); setIsAssignModalOpen(true); }} className="p-2 bg-[var(--theme-bg)] hover:bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] rounded-lg"><UserPlus className="h-4 w-4" /></button>}
                    {item.status === "Assigned" && <button onClick={() => { setSelectedItem(item); setIsReturnModalOpen(true); }} className="p-2 bg-[var(--theme-bg)] hover:bg-[#10B981]/10 text-[#10B981] rounded-lg"><RotateCcw className="h-4 w-4" /></button>}
                    <button onClick={() => { setSelectedItem(item); setIsMaintenanceModalOpen(true); }} className="p-2 bg-[var(--theme-bg)] hover:bg-[#F59E0B]/10 text-[#F59E0B] rounded-lg"><Wrench className="h-4 w-4" /></button>
                    <button onClick={() => openHistory(item)} className="p-2 bg-[var(--theme-bg)] hover:bg-blue-500/10 text-blue-500 rounded-lg"><HistoryIcon className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {filteredItems.length > 0 && <div className="mt-4"><Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} loading={loading} /></div>}
      </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-3xl shadow-2xl max-w-sm w-full p-6 relative">
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">{confirmModal.title}</h2>
            <p className="text-sm text-[var(--theme-text-muted)] mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button onClick={closeConfirm} className="flex-1 py-2.5 bg-[var(--theme-bg)] text-[var(--theme-text)] rounded-xl font-bold border border-[var(--theme-border)]">cancel</button>
              <button onClick={() => { confirmModal.action(); closeConfirm(); }} className="flex-1 py-2.5 text-white bg-red-600 rounded-xl font-bold">confirm</button>
            </div>
          </div>
        </div>
      )}

      {isHistoryModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-lg w-full p-6 md:p-8 relative max-h-[90vh] flex flex-col border border-[var(--theme-border)]">
            <button onClick={() => setIsHistoryModalOpen(false)} className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full"><X className="h-4 w-4" /></button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">asset history</h2>
            <p className="font-mono text-sm text-[var(--theme-accent)] mb-6">{selectedItem.identifier}</p>
            <div className="overflow-y-auto pr-2 space-y-6 flex-1">
              {historyLoading ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent)]" /></div> : itemHistory.length === 0 ? <p className="text-[var(--theme-text-muted)] text-sm italic">no history.</p> : (
                <div className="relative border-l-2 border-[var(--theme-border)] ml-3 space-y-8 pb-4">
                  {itemHistory.map((log) => (
                    <div key={log._id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-[var(--theme-panel)] border-2 border-[var(--theme-accent)]"></div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[var(--theme-text-muted)] mb-1">{new Date(log.createdAt).toLocaleString()}</span>
                        <span className="text-sm font-semibold text-[var(--theme-text)] mb-1">{log.action}</span>
                        {log.targetUser && <span className="text-sm text-[var(--theme-text-muted)]">user: <b>{log.targetUser.fullname}</b></span>}
                        {log.notes && <div className="mt-2 p-3 bg-[var(--theme-bg)] rounded-xl border border-[var(--theme-border)]"><span className="flex items-center gap-2 text-xs font-bold text-[var(--theme-text-muted)] mb-1"><MessageSquareText className="h-3 w-3" /> remarks</span><p className="text-sm text-[var(--theme-text)] italic">{log.notes}</p></div>}
                        {log.image && <div className="mt-3 rounded-xl overflow-hidden border border-[var(--theme-border)] max-w-xs"><img src={log.image} alt="proof" className="w-full h-auto object-cover" /></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isReturnModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-sm w-full p-6 relative border border-[var(--theme-border)]">
            <button onClick={() => { setIsReturnModalOpen(false); setReturnNotes(""); setReturnImageFile(null); setReturnImagePreview(null); }} className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full"><X className="h-4 w-4" /></button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">return asset</h2>
            <form onSubmit={handleReturnSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">remarks</label>
                <textarea value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)} className="w-full p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm focus:outline-none h-20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">photo (optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--theme-border)] rounded-xl cursor-pointer overflow-hidden relative">
                  {returnImagePreview ? <img src={returnImagePreview} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-[var(--theme-text-muted)]"><Upload className="h-6 w-6 mb-2" /><span className="text-xs font-semibold">click to upload</span></div>}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageSelect(e, setReturnImageFile, setReturnImagePreview)} />
                </label>
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-[var(--theme-text)] text-[var(--theme-panel)] rounded-xl font-bold">confirm return</button>
            </form>
          </div>
        </div>
      )}

      {isMaintenanceModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-sm w-full p-6 relative border border-[var(--theme-border)]">
            <button onClick={() => { setIsMaintenanceModalOpen(false); setMaintenanceNotes(""); setMaintenanceImageFile(null); setMaintenanceImagePreview(null); }} className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full"><X className="h-4 w-4" /></button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">toggle maintenance</h2>
            <form onSubmit={handleMaintenanceSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">remarks</label>
                <textarea value={maintenanceNotes} onChange={(e) => setMaintenanceNotes(e.target.value)} className="w-full p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm focus:outline-none h-20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">photo (optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--theme-border)] rounded-xl cursor-pointer overflow-hidden relative">
                  {maintenanceImagePreview ? <img src={maintenanceImagePreview} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-[var(--theme-text-muted)]"><Upload className="h-6 w-6 mb-2" /><span className="text-xs font-semibold">click to upload</span></div>}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageSelect(e, setMaintenanceImageFile, setMaintenanceImagePreview)} />
                </label>
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-[var(--theme-text)] text-[var(--theme-panel)] rounded-xl font-bold">confirm</button>
            </form>
          </div>
        </div>
      )}

      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-md w-full p-8 relative border border-[var(--theme-border)]">
            <button onClick={() => { setIsAssignModalOpen(false); setAssignNotes(""); setAssignImageFile(null); setAssignImagePreview(null); }} className="absolute top-6 right-6 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full"><X className="h-4 w-4" /></button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-4">assign asset</h2>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <input type="text" placeholder="search user..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-full p-3 bg-[var(--theme-bg)] text-[var(--theme-text)] border border-[var(--theme-border)] rounded-xl font-medium" />
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredUsers.map((user) => (
                  <label key={user._id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${selectedUserId === user._id ? 'bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]' : 'hover:bg-[var(--theme-bg)] border border-transparent'}`}>
                    <input type="radio" name="user" value={user._id} checked={selectedUserId === user._id} onChange={(e) => setSelectedUserId(e.target.value)} className="hidden" />
                    <div><div className="font-bold text-sm text-[var(--theme-text)]">{user.fullname}</div><div className="text-xs text-[var(--theme-text-muted)]">{user.instituteEmail}</div></div>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">notes</label>
                <textarea value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} className="w-full p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm focus:outline-none h-16" />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">photo (optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--theme-border)] rounded-xl cursor-pointer overflow-hidden relative">
                  {assignImagePreview ? <img src={assignImagePreview} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-[var(--theme-text-muted)]"><Upload className="h-6 w-6 mb-2" /><span className="text-xs font-semibold">click to upload</span></div>}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageSelect(e, setAssignImageFile, setAssignImagePreview)} />
                </label>
              </div>
              <button type="submit" className="w-full py-3 bg-[var(--theme-text)] text-[var(--theme-panel)] rounded-xl font-bold">assign</button>
            </form>
          </div>
        </div>
      )}

      {isAddFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-sm w-full p-6 relative border border-[var(--theme-border)]">
            <button onClick={() => { setIsAddFolderModalOpen(false); setNewFolderName(""); }} className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full"><X className="h-4 w-4" /></button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">create directory</h2>
            <form onSubmit={handleAddFolder} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">folder name</label>
                <input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="e.g. Laptops" className="w-full p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm focus:outline-none" autoFocus />
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-[var(--theme-accent)] text-white rounded-xl font-bold hover:opacity-90">create folder</button>
            </form>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-sm w-full p-6 relative border border-[var(--theme-border)]">
            <button onClick={() => { setIsAddModalOpen(false); setNewItem({ identifier: "" }); setAddAssetImageFile(null); setAddAssetImagePreview(null); }} className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full"><X className="h-4 w-4" /></button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">add new asset</h2>
            <form onSubmit={handleAddItem} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">asset name</label>
                <input type="text" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="e.g. MacBook Pro M3" className="w-full p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm focus:outline-none" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">asset identifier</label>
                <input type="text" value={newItem.identifier} onChange={(e) => setNewItem({ ...newItem, identifier: e.target.value })} placeholder="e.g. MBP-2024-001" className="w-full p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-2">photo (optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--theme-border)] rounded-xl cursor-pointer overflow-hidden relative">
                  {addAssetImagePreview ? <img src={addAssetImagePreview} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-[var(--theme-text-muted)]"><Upload className="h-6 w-6 mb-2" /><span className="text-xs font-semibold">click to upload</span></div>}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageSelect(e, setAddAssetImageFile, setAddAssetImagePreview)} />
                </label>
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-[var(--theme-text)] text-[var(--theme-panel)] rounded-xl font-bold">add asset</button>
            </form>
          </div>
        </div>
      )}

      {isImageViewerOpen && viewingImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsImageViewerOpen(false)}>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsImageViewerOpen(false)} className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-black/50 rounded-full"><X className="h-6 w-6" /></button>
            <img src={viewingImage} alt="Asset Image" className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;