/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  PackagePlus,
  MonitorSmartphone,
  Search,
  Wrench,
  RotateCcw,
  UserPlus,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Trash2,
  Image as ImageIcon,
  ArrowLeft,
  List,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Pagination from "../components/Pagination";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .inv-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

  @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

  .dark-input {
    width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; color: #e4e4e7; font-size: 13px; padding: 10px 14px; outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .dark-input:focus { background: rgba(255,255,255,0.07); border-color: rgba(37,99,235,0.6); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
  .dark-select {
    appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px !important;
  }
  .dark-select option { background: #141418; color: #e4e4e7; }

  .btn-primary-sm {
    display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    color: #fff; font-size: 13px; font-weight: 600; border: none; border-radius: 10px; cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
    box-shadow: 0 4px 14px rgba(79,70,229,0.3);
  }
  .btn-primary-sm:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,0.45); filter: brightness(1.08); }
  
  .btn-ghost-sm {
    display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px;
    font-size: 12px; font-weight: 500; border-radius: 8px; cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease; border: 1px solid transparent; background: transparent; color: #a1a1aa;
  }
  .btn-ghost-sm:hover { background: rgba(255,255,255,0.05); color: #e4e4e7; }

  .type-card {
    background: rgba(20,20,24,0.95); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; overflow: hidden; position: relative;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .type-card:hover {
    transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.15);
  }

  .menu-dropdown {
    position: absolute; right: 8px; top: 32px; background: #18181b; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.8); z-index: 10; min-width: 160px;
    padding: 6px; display: flex; flex-direction: column; gap: 2px;
  }
  .menu-item {
    display: flex; align-items: center; gap: 8px; padding: 8px 10px; font-size: 12px; font-weight: 500;
    color: #d4d4d8; border-radius: 6px; cursor: pointer; transition: background 0.15s; text-align: left; background: none; border: none;
  }
  .menu-item:hover { background: rgba(255,255,255,0.06); }
  .menu-item.danger { color: #f87171; }
  .menu-item.danger:hover { background: rgba(239,68,68,0.1); }

  .modal-overlay { background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); animation: fade-in 0.2s ease forwards; }
  .modal-card { background: #141418; border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; box-shadow: 0 32px 80px rgba(0,0,0,0.8); animation: fade-in 0.28s cubic-bezier(.16,1,.3,1) forwards; }

  /* Table styles */
  .inv-card { background: rgba(20,20,24,0.95); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; box-shadow: 0 8px 40px rgba(0,0,0,0.5); }
  .inv-th { padding: 13px 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #52525b; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); white-space: nowrap; }
  .inv-td { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
  .inv-row { transition: background 0.15s ease; }
  .inv-row:hover { background: rgba(255,255,255,0.03); }

  .badge-available  { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
  .badge-assigned   { background: rgba(37,99,235,0.12);  color: #60a5fa; border: 1px solid rgba(37,99,235,0.2);  }
  .badge-maint      { background: rgba(245,158,11,0.12); color: #fbbf24; border: 1px solid rgba(245,158,11,0.2); }

  .action-assign   { background: rgba(37,99,235,0.1);  color: #60a5fa; border-color: rgba(37,99,235,0.2);  }
  .action-assign:hover { background: rgba(37,99,235,0.2); }
  .action-return   { background: rgba(16,185,129,0.1); color: #34d399; border-color: rgba(16,185,129,0.2); }
  .action-return:hover { background: rgba(16,185,129,0.2); }
  .action-maint    { background: rgba(245,158,11,0.1); color: #fbbf24; border-color: rgba(245,158,11,0.2); }
  .action-maint:hover { background: rgba(245,158,11,0.2); }
  .action-fix      { background: rgba(113,113,122,0.1); color: #a1a1aa; border-color: rgba(113,113,122,0.2); }
  .action-fix:hover { background: rgba(113,113,122,0.18); }
`;

const CATEGORIES = ["Hardware", "Software License", "Accessories", "Networking"];

const Inventory = () => {
  const [itemTypes, setItemTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  
  // Modals
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [newItemType, setNewItemType] = useState({ name: "", category: "Hardware", description: "", thumbnail: "" });
  
  // Expanded Categories
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Menu State
  const [activeMenuId, setActiveMenuId] = useState(null);

  // View state: null for categories view, or an ItemType object for items view
  const [selectedTypeView, setSelectedTypeView] = useState(null);

  // Items State (when a type is selected)
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItemIdentifier, setNewItemIdentifier] = useState("");
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  // Refs for click outside
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Item Types
  const fetchItemTypes = useCallback(async () => {
    try {
      setLoadingTypes(true);
      const response = await api.get("/item-types");
      setItemTypes(response.data.itemTypes);
    } catch (error) {
      toast.error("Failed to load item types.");
    } finally {
      setLoadingTypes(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedTypeView) {
      fetchItemTypes();
    }
  }, [fetchItemTypes, selectedTypeView]);

  // Fetch Items for a Type
  const fetchItems = useCallback(async () => {
    if (!selectedTypeView) return;
    try {
      setLoadingItems(true);
      const [itemsRes, usersRes] = await Promise.all([
        api.get(`/items?itemType=${selectedTypeView._id}&page=${page}&limit=${limit}&search=${searchTerm}${statusFilter ? `&status=${statusFilter}` : ""}`),
        api.get("/users?limit=100"),
      ]);
      setItems(itemsRes.data.items);
      setPagination(itemsRes.data.pagination);
      setUsers(usersRes.data.users);
    } catch (error) {
      toast.error("Failed to load items.");
    } finally {
      setLoadingItems(false);
    }
  }, [selectedTypeView, page, limit, searchTerm, statusFilter]);

  useEffect(() => {
    if (selectedTypeView) fetchItems();
  }, [fetchItems, selectedTypeView]);

  // ─── Handlers for Item Types ───

  const handleCreateType = async (e) => {
    e.preventDefault();
    try {
      await api.post("/item-types", newItemType);
      toast.success("Item Type created successfully!");
      setIsAddTypeModalOpen(false);
      setNewItemType({ name: "", category: "Hardware", description: "", thumbnail: "" });
      fetchItemTypes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create Item Type.");
    }
  };

  const handleDeleteType = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This will delete all assets inside it permanently!`)) return;
    try {
      await api.delete(`/item-types/${id}`);
      toast.success(`${name} deleted successfully.`);
      fetchItemTypes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete.");
    }
  };

  const toggleCategoryExpand = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // ─── Handlers for Items ───

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await api.post("/items", { itemType: selectedTypeView._id, identifier: newItemIdentifier });
      toast.success("Asset added successfully!");
      setIsAddItemModalOpen(false);
      setNewItemIdentifier("");
      fetchItems();
      // Update local type stats
      selectedTypeView.stats.total += 1;
      selectedTypeView.stats.available += 1;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add asset.");
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return toast.error("Select a user.");
    try {
      await api.put(`/items/${selectedItem._id}/assign`, { userId: selectedUserId });
      toast.success("Assigned successfully!");
      setIsAssignModalOpen(false);
      setSelectedItem(null);
      setSelectedUserId("");
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign.");
    }
  };

  const handleReturn = async (item) => {
    if (!window.confirm("Return this item?")) return;
    try {
      await api.put(`/items/${item._id}/return`);
      toast.success("Item returned.");
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to return.");
    }
  };

  const handleMaintenance = async (item) => {
    const isFixing = item.status === "Under Maintenance";
    if (!window.confirm(isFixing ? "Mark as fixed?" : "Send to maintenance?")) return;
    try {
      // Assuming toggle logic handles it internally without body or with empty body
      await api.put(`/items/${item._id}/maintenance`);
      toast.success(isFixing ? "Item available." : "Sent to maintenance.");
      fetchItems();
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const statusBadge = (status) => {
    const map = {
      Available: { cls: "badge-available", dot: "#34d399" },
      Assigned: { cls: "badge-assigned", dot: "#60a5fa" },
      "Under Maintenance": { cls: "badge-maint", dot: "#fbbf24" },
    };
    const cfg = map[status] || { cls: "", dot: "#71717a" };
    return (
      <span className={cfg.cls} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
        <span style={{ height: 6, width: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
        {status}
      </span>
    );
  };

  const filteredUsers = users.filter(u => u.accountStatus === "Approved" && (u.fullname.toLowerCase().includes(userSearch.toLowerCase()) || u.instituteEmail.toLowerCase().includes(userSearch.toLowerCase())));

  // ─── Renderers ───

  const renderCategoriesView = () => {
    if (loadingTypes) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 text-blue-400 animate-spin mb-3" />
          <p className="text-zinc-500 text-sm">Loading inventory types...</p>
        </div>
      );
    }

    return (
      <div className="space-y-10 animate-fade-in">
        {CATEGORIES.map(category => {
          const typesInCategory = itemTypes.filter(t => t.category === category);
          if (typesInCategory.length === 0) return null;

          const isExpanded = expandedCategories[category];
          const visibleTypes = isExpanded ? typesInCategory : typesInCategory.slice(0, 4);
          const hasMore = typesInCategory.length > 4;

          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-zinc-100">{category}</h2>
                <div className="h-px flex-1 bg-zinc-800"></div>
                <span className="text-xs font-semibold text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md">{typesInCategory.length} Types</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {visibleTypes.map(type => (
                  <div key={type._id} className="type-card flex flex-col cursor-pointer group" onClick={() => setSelectedTypeView(type)}>
                    <div className="h-32 w-full bg-zinc-900 overflow-hidden relative border-b border-zinc-800">
                      {type.thumbnail ? (
                        <img 
                          src={type.thumbnail} 
                          alt={type.name} 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} 
                        />
                      ) : null}
                      <div 
                        className="w-full h-full bg-zinc-900/50 flex items-center justify-center absolute inset-0" 
                        style={{ display: type.thumbnail ? 'none' : 'flex' }}
                      >
                        <Package className="h-10 w-10 text-zinc-700" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141418] to-transparent"></div>
                      
                      {/* Three dot menu */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === type._id ? null : type._id); }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-zinc-300 hover:bg-black/60 hover:text-white transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {activeMenuId === type._id && (
                        <div className="menu-dropdown" ref={menuRef}>
                          <button className="menu-item" onClick={(e) => { e.stopPropagation(); setSelectedTypeView(type); setActiveMenuId(null); }}>
                            <List className="h-3.5 w-3.5" /> View Instances
                          </button>
                          <button className="menu-item" onClick={(e) => { e.stopPropagation(); toast.success("Feature coming soon!"); setActiveMenuId(null); }}>
                            <ImageIcon className="h-3.5 w-3.5" /> Change Thumbnail
                          </button>
                          <button className="menu-item danger" onClick={(e) => { e.stopPropagation(); handleDeleteType(type._id, type.name); setActiveMenuId(null); }}>
                            <Trash2 className="h-3.5 w-3.5" /> Delete Type
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-sm font-bold text-zinc-100 mb-2 truncate group-hover:text-blue-400 transition-colors">{type.name}</h3>
                      
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Available</span>
                          <span className="text-emerald-400 font-bold text-sm font-mono">{type.stats?.available || 0}</span>
                        </div>
                        <div className="w-px h-6 bg-zinc-800"></div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Issued</span>
                          <span className="text-blue-400 font-bold text-sm font-mono">{type.stats?.assigned || 0}</span>
                        </div>
                        {type.stats?.maintenance > 0 && (
                          <>
                            <div className="w-px h-6 bg-zinc-800"></div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Maint</span>
                              <span className="text-amber-400 font-bold text-sm font-mono">{type.stats?.maintenance || 0}</span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-auto leading-relaxed">
                        {type.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-2">
                  <button 
                    onClick={() => toggleCategoryExpand(category)}
                    className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-blue-400 transition-colors px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-blue-900/50"
                  >
                    {isExpanded ? (
                      <><ChevronUp className="h-4 w-4" /> Show Less</>
                    ) : (
                      <><ChevronDown className="h-4 w-4" /> Show All ({typesInCategory.length})</>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {itemTypes.length === 0 && !loadingTypes && (
          <div className="text-center py-16">
            <PackagePlus className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-300">No Item Types Found</h3>
            <p className="text-sm text-zinc-500 mt-2">Create your first item type to start managing inventory.</p>
          </div>
        )}
      </div>
    );
  };

  const renderItemsView = () => {
    return (
      <div className="animate-fade-in flex flex-col h-full">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setSelectedTypeView(null); fetchItemTypes(); setStatusFilter(""); }}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Inventory</span>
                <span className="text-xs text-zinc-600">&gt;</span>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{selectedTypeView.category}</span>
                <span className="text-xs text-zinc-600">&gt;</span>
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{selectedTypeView.name}</span>
              </div>
              <h1 className="text-2xl font-bold text-white leading-none">{selectedTypeView.name} Instances</h1>
            </div>
          </div>
          <button className="btn-primary-sm" onClick={() => setIsAddItemModalOpen(true)}>
            <PackagePlus className="h-4 w-4" /> Add Instance
          </button>
        </div>

        {/* Status Line */}
        <div className="flex bg-zinc-900 rounded-xl border border-zinc-800 p-4 mb-6 gap-6">
          <div className="flex-1 flex flex-col items-center justify-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-emerald-400 font-bold text-2xl font-mono">{selectedTypeView.stats?.available || 0}</span>
            <span className="text-[11px] uppercase font-bold text-emerald-500/80 tracking-wider mt-1">Available</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <span className="text-blue-400 font-bold text-2xl font-mono">{selectedTypeView.stats?.assigned || 0}</span>
            <span className="text-[11px] uppercase font-bold text-blue-500/80 tracking-wider mt-1">Issued</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-400 font-bold text-2xl font-mono">{selectedTypeView.stats?.maintenance || 0}</span>
            <span className="text-[11px] uppercase font-bold text-amber-500/80 tracking-wider mt-1">Maintenance</span>
          </div>
        </div>

        {/* Table wrapper */}
        <div className="inv-card flex-1 flex flex-col">
          <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-[250px]">
                <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search by ID..." 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="dark-input pl-9" 
                />
              </div>
              <select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="dark-input dark-select w-[180px]"
              >
                <option value="">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Assigned">Issued (Assigned)</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            {loadingItems ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="inv-th text-left">ID Tag</th>
                    <th className="inv-th text-left">Status</th>
                    <th className="inv-th text-left">Assigned To</th>
                    <th className="inv-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-zinc-500 text-sm">
                        No instances found for this type.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item._id} className="inv-row">
                        <td className="inv-td">
                          <span className="font-mono text-xs bg-zinc-800/50 border border-zinc-700/50 px-2 py-1 rounded text-zinc-300">
                            {item.identifier}
                          </span>
                        </td>
                        <td className="inv-td">{statusBadge(item.status)}</td>
                        <td className="inv-td">
                          {item.assignedTo ? (
                            <span className="text-sm font-medium text-zinc-200">{item.assignedTo.fullname}</span>
                          ) : (
                            <span className="text-sm italic text-zinc-600">Unassigned</span>
                          )}
                        </td>
                        <td className="inv-td text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.status === "Available" && (
                              <button className="btn-ghost-sm action-assign" onClick={() => { setSelectedItem(item); setIsAssignModalOpen(true); }}>
                                <UserPlus className="h-3.5 w-3.5" /> Assign
                              </button>
                            )}
                            {item.status === "Assigned" && (
                              <button className="btn-ghost-sm action-return" onClick={() => handleReturn(item)}>
                                <RotateCcw className="h-3.5 w-3.5" /> Return
                              </button>
                            )}
                            <button className={`btn-ghost-sm ${item.status === "Under Maintenance" ? "action-fix" : "action-maint"}`} onClick={() => handleMaintenance(item)}>
                              <Wrench className="h-3.5 w-3.5" /> {item.status === "Under Maintenance" ? "Fix" : "Maint"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} loading={loadingItems} />
        </div>
      </div>
    );
  };

  return (
    <div className="inv-root max-w-7xl mx-auto h-full flex flex-col">
      <style>{css}</style>
      
      {!selectedTypeView && (
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Hardware Inventory</h1>
            <p className="text-sm text-zinc-400">Manage categories, types, and individual assets.</p>
          </div>
          <button className="btn-primary-sm" onClick={() => setIsAddTypeModalOpen(true)}>
            <PackagePlus className="h-4 w-4" /> Add Item Type
          </button>
        </div>
      )}

      {selectedTypeView ? renderItemsView() : renderCategoriesView()}

      {/* ─── Modals ─── */}

      {/* Add Type Modal */}
      {isAddTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="modal-card w-full max-w-md p-8 relative">
            <button onClick={() => setIsAddTypeModalOpen(false)} className="absolute top-5 right-5 p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Add New Item Type</h2>
              <p className="text-sm text-zinc-500">Create a new category model (e.g., MacBook Pro M3).</p>
            </div>
            <form onSubmit={handleCreateType} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wide">Type Name</label>
                <input required type="text" placeholder="e.g. MacBook Pro M3" value={newItemType.name} onChange={(e) => setNewItemType({...newItemType, name: e.target.value})} className="dark-input" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wide">Category</label>
                <select value={newItemType.category} onChange={(e) => setNewItemType({...newItemType, category: e.target.value})} className="dark-input dark-select">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wide">Image URL</label>
                <input type="text" placeholder="https://..." value={newItemType.thumbnail} onChange={(e) => setNewItemType({...newItemType, thumbnail: e.target.value})} className="dark-input font-mono text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea rows={3} placeholder="Brief description..." value={newItemType.description} onChange={(e) => setNewItemType({...newItemType, description: e.target.value})} className="dark-input resize-none"></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAddTypeModalOpen(false)} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">Create Type</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Instance Modal */}
      {isAddItemModalOpen && selectedTypeView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="modal-card w-full max-w-sm p-8 relative">
            <button onClick={() => setIsAddItemModalOpen(false)} className="absolute top-5 right-5 p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Add Instance</h2>
              <p className="text-sm text-zinc-500">Add a new {selectedTypeView.name} to the system.</p>
            </div>
            <form onSubmit={handleCreateItem} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wide">Unique Identifier Tag</label>
                <input required type="text" placeholder="e.g. MAC-001" value={newItemIdentifier} onChange={(e) => setNewItemIdentifier(e.target.value)} className="dark-input font-mono" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAddItemModalOpen(false)} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="modal-card w-full max-w-sm p-8 relative">
            <button onClick={() => { setIsAssignModalOpen(false); setSelectedItem(null); setSelectedUserId(""); }} className="absolute top-5 right-5 p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white mb-1">Assign Asset</h2>
              <p className="text-sm text-zinc-500">Issuing <span className="text-zinc-300 font-mono">{selectedItem.identifier}</span></p>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="mb-4">
                <div className="relative">
                  <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="dark-input pl-9 mb-3" />
                </div>
                <div className="max-h-[200px] overflow-y-auto border border-zinc-800 rounded-xl bg-zinc-900/50 p-1">
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-sm text-zinc-500">No users found.</div>
                  ) : (
                    filteredUsers.map(u => (
                      <label key={u._id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedUserId === u._id ? 'bg-blue-900/30 border border-blue-800/50' : 'hover:bg-zinc-800/50 border border-transparent'}`}>
                        <input type="radio" name="user" value={u._id} checked={selectedUserId === u._id} onChange={(e) => setSelectedUserId(e.target.value)} className="accent-blue-500" />
                        <div>
                          <div className="text-sm font-semibold text-zinc-200">{u.fullname}</div>
                          <div className="text-xs text-zinc-500 font-mono">{u.instituteEmail}</div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setIsAssignModalOpen(false); setSelectedItem(null); setSelectedUserId(""); }} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;