/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
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
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Pagination from "../components/Pagination";

/* ─── shared dark-theme tokens (inline so no external CSS file needed) ── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .inv-root * { font-family: 'DM Sans', sans-serif; }

  @keyframes inv-fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes inv-row-in {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes modal-in {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
  @keyframes overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .inv-card {
    background: rgba(20,20,24,0.95);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03);
  }

  .inv-header-animate { animation: inv-fade-up 0.45s cubic-bezier(.16,1,.3,1) both; }
  .inv-card-animate   { animation: inv-fade-up 0.5s  cubic-bezier(.16,1,.3,1) 0.08s both; }

  .inv-row {
    transition: background 0.15s ease;
    animation: inv-row-in 0.35s cubic-bezier(.16,1,.3,1) both;
  }
  .inv-row:hover { background: rgba(255,255,255,0.03) !important; }

  .inv-th {
    padding: 13px 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #52525b;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    white-space: nowrap;
  }
  .inv-td {
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    vertical-align: middle;
  }

  .dark-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: #e4e4e7;
    font-size: 13px;
    padding: 10px 14px;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .dark-input::placeholder { color: #52525b; }
  .dark-input:focus {
    background: rgba(255,255,255,0.07);
    border-color: rgba(37,99,235,0.6);
    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
  }
  .dark-select {
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px !important;
  }

  .btn-primary-sm {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    color: #fff; font-size: 13px; font-weight: 600;
    border: none; border-radius: 10px; cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
    box-shadow: 0 4px 14px rgba(79,70,229,0.3);
  }
  .btn-primary-sm:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(79,70,229,0.45);
    filter: brightness(1.08);
  }
  .btn-primary-sm:active { transform: translateY(0) scale(0.97); }

  .btn-ghost-sm {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px;
    font-size: 12px; font-weight: 500;
    border-radius: 8px; cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
    border: 1px solid transparent;
  }

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

  .modal-overlay {
    animation: overlay-in 0.2s ease both;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
  }
  .modal-card {
    animation: modal-in 0.28s cubic-bezier(.16,1,.3,1) both;
    background: #141418;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 22px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03);
  }

  .user-radio-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px; cursor: pointer;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.15s ease;
  }
  .user-radio-row:last-child { border-bottom: none; }
  .user-radio-row:hover { background: rgba(37,99,235,0.08); }
  .user-radio-row.selected { background: rgba(37,99,235,0.14); }

  .icon-cell {
    height: 36px; width: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.07);
    flex-shrink: 0;
  }
`;

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    identifier: "",
    category: "Hardware",
  });
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsResponse, usersResponse] = await Promise.all([
        api.get(`/items?page=${page}&limit=${limit}`),
        api.get("/users?limit=100"),
      ]);
      setItems(itemsResponse.data.items);
      setPagination(itemsResponse.data.pagination);
      setUsers(usersResponse.data.users);
    } catch (error) {
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredUsers = users
    .filter((u) => u.accountStatus === "Approved")
    .filter(
      (u) =>
        u.fullname.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.instituteEmail.toLowerCase().includes(userSearch.toLowerCase()),
    );

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/items", newItem);
      toast.success(`${newItem.name} added to inventory!`);
      setIsAddModalOpen(false);
      setNewItem({ name: "", identifier: "", category: "Hardware" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add asset");
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return toast.error("Please select a user.");
    try {
      await api.put(`/items/${selectedItem._id}/assign`, { userId: selectedUserId });
      toast.success(`${selectedItem.name} has been assigned!`);
      setIsAssignModalOpen(false);
      setSelectedItem(null);
      setSelectedUserId("");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign item");
    }
  };

  const handleReturn = async (item) => {
    if (!window.confirm(`Are you sure you want to log the return of ${item.name}?`)) return;
    try {
      await api.put(`/items/${item._id}/return`);
      toast.success("Item successfully returned to inventory.");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to return item");
    }
  };

  const handleMaintenance = async (item) => {
    const isFixing = item.status === "Under Maintenance";
    const actionText = isFixing ? "mark as repaired" : "send to maintenance";
    if (!window.confirm(`Are you sure you want to ${actionText} this item?`)) return;
    try {
      const targetStatus = isFixing ? "Available" : "Under Maintenance";
      await api.put(`/items/${item._id}/maintenance`, { status: targetStatus });
      toast.success(isFixing ? "Item repaired and available!" : "Item sent to maintenance.");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update maintenance status");
    }
  };

  /* ── helpers ── */
  const statusBadge = (status) => {
    const map = {
      Available: { cls: "badge-available", dot: "#34d399" },
      Assigned: { cls: "badge-assigned", dot: "#60a5fa" },
      "Under Maintenance": { cls: "badge-maint", dot: "#fbbf24" },
    };
    const cfg = map[status] || { cls: "", dot: "#71717a" };
    return (
      <span
        className={cfg.cls}
        style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "3px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600,
        }}
      >
        <span style={{ height: 6, width: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="inv-root h-full w-full flex items-center justify-center" style={{ minHeight: 300 }}>
        <style>{css}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Loader2 style={{ height: 32, width: 32, color: "#60a5fa", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#52525b", fontSize: 13 }}>Loading inventory…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inv-root" style={{ maxWidth: 1280, margin: "0 auto" }}>
      <style>{css}</style>

      {/* ── Page header ── */}
      <div className="inv-header-animate" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f4f4f5", margin: 0, letterSpacing: "-0.01em" }}>
            Hardware Inventory
          </h1>
          <p style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>
            Track, assign, and maintain institutional assets.
          </p>
        </div>
        <button className="btn-primary-sm" onClick={() => setIsAddModalOpen(true)}>
          <PackagePlus style={{ height: 15, width: 15 }} />
          Add Asset
        </button>
      </div>

      {/* ── Main card ── */}
      <div className="inv-card inv-card-animate">

        {/* Toolbar */}
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ position: "relative", width: 280 }}>
            <Search style={{
              height: 14, width: 14, color: "#52525b",
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              pointerEvents: "none",
            }} />
            <input
              type="text"
              placeholder="Search by name, ID or category…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dark-input"
              style={{ paddingLeft: 34, paddingRight: 14, fontSize: 13 }}
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                fontSize: 12, color: "#71717a", background: "none", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a1a1aa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
            >
              <X style={{ height: 12, width: 12 }} /> Clear
            </button>
          )}
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#3f3f46" }}>
            {filteredItems.length} asset{filteredItems.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Asset Name", "ID Tag", "Category", "Status", "Assigned To", "Actions"].map((h, i) => (
                  <th key={h} className="inv-th" style={{ textAlign: i === 5 ? "right" : "left" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "52px 20px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                      <div className="icon-cell" style={{ height: 44, width: 44 }}>
                        <MonitorSmartphone style={{ height: 20, width: 20, color: "#52525b" }} />
                      </div>
                      <p style={{ color: "#52525b", fontSize: 13 }}>No assets match your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr
                    key={item._id}
                    className="inv-row"
                    style={{ animationDelay: `${idx * 0.03}s` }}
                  >
                    {/* Asset name */}
                    <td className="inv-td">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="icon-cell">
                          <MonitorSmartphone style={{ height: 16, width: 16, color: "#60a5fa" }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7" }}>
                          {item.name}
                        </span>
                      </div>
                    </td>
                    {/* ID */}
                    <td className="inv-td">
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12, color: "#71717a",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        padding: "3px 8px", borderRadius: 6,
                      }}>
                        {item.identifier}
                      </span>
                    </td>
                    {/* Category */}
                    <td className="inv-td" style={{ fontSize: 13, color: "#a1a1aa" }}>
                      {item.category}
                    </td>
                    {/* Status */}
                    <td className="inv-td">{statusBadge(item.status)}</td>
                    {/* Assigned to */}
                    <td className="inv-td" style={{ fontSize: 13 }}>
                      {item.assignedTo ? (
                        <span style={{ color: "#d4d4d8", fontWeight: 500 }}>
                          {item.assignedTo.fullname}
                        </span>
                      ) : (
                        <span style={{ color: "#3f3f46", fontStyle: "italic" }}>Unassigned</span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="inv-td" style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                        {item.status === "Available" && (
                          <button
                            className="btn-ghost-sm action-assign"
                            onClick={() => { setSelectedItem(item); setIsAssignModalOpen(true); }}
                          >
                            <UserPlus style={{ height: 13, width: 13 }} /> Assign
                          </button>
                        )}
                        {item.status === "Assigned" && (
                          <button className="btn-ghost-sm action-return" onClick={() => handleReturn(item)}>
                            <RotateCcw style={{ height: 13, width: 13 }} /> Return
                          </button>
                        )}
                        <button
                          className={`btn-ghost-sm ${item.status === "Under Maintenance" ? "action-fix" : "action-maint"}`}
                          onClick={() => handleMaintenance(item)}
                        >
                          <Wrench style={{ height: 13, width: 13 }} />
                          {item.status === "Under Maintenance" ? "Fix" : "Maint"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            onLimitChange={handleLimitChange}
            loading={loading}
          />
        </div>
      </div>

      {/* ══════════ ASSIGN MODAL ══════════ */}
      {isAssignModalOpen && (
        <div
          className="modal-overlay"
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div className="modal-card" style={{ width: "100%", maxWidth: 440, padding: "32px 28px", position: "relative" }}>

            {/* Close */}
            <button
              onClick={() => { setIsAssignModalOpen(false); setSelectedItem(null); setSelectedUserId(""); setUserSearch(""); }}
              style={{
                position: "absolute", top: 20, right: 20,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8, padding: 6, cursor: "pointer", color: "#71717a",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "#f87171"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#71717a"; }}
            >
              <X style={{ height: 15, width: 15 }} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: 22 }}>
              <div style={{
                height: 44, width: 44, borderRadius: 12, marginBottom: 14,
                background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <UserPlus style={{ height: 20, width: 20, color: "#60a5fa" }} />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#f4f4f5", margin: 0 }}>Assign Hardware</h2>
              <p style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>
                Issuing{" "}
                <span style={{ color: "#d4d4d8", fontWeight: 600 }}>{selectedItem?.name}</span>
                {" "}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#52525b" }}>
                  ({selectedItem?.identifier})
                </span>
              </p>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 8 }}>
                Select User
              </label>

              {/* Search */}
              <div style={{ position: "relative", marginBottom: 8 }}>
                <Search style={{
                  height: 13, width: 13, color: "#52525b",
                  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  pointerEvents: "none",
                }} />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="dark-input"
                  style={{ paddingLeft: 32 }}
                />
              </div>

              {/* User list */}
              <div style={{
                maxHeight: 200, overflowY: "auto",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, marginBottom: 20,
              }}>
                {filteredUsers.length === 0 ? (
                  <p style={{ padding: "14px 16px", fontSize: 13, color: "#52525b", textAlign: "center" }}>
                    No users found.
                  </p>
                ) : (
                  filteredUsers.map((user) => (
                    <label
                      key={user._id}
                      className={`user-radio-row${selectedUserId === user._id ? " selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="selectedUser"
                        value={user._id}
                        checked={selectedUserId === user._id}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        style={{ accentColor: "#2563eb" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#d4d4d8" }}>{user.fullname}</div>
                        <div style={{ fontSize: 11, color: "#52525b", fontFamily: "'JetBrains Mono', monospace" }}>
                          {user.instituteEmail}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => { setIsAssignModalOpen(false); setSelectedUserId(""); setUserSearch(""); }}
                  style={{
                    flex: 1, padding: "11px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "#a1a1aa", cursor: "pointer", transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-sm" style={{ flex: 1, padding: "11px 16px", justifyContent: "center" }}>
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ ADD ASSET MODAL ══════════ */}
      {isAddModalOpen && (
        <div
          className="modal-overlay"
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div className="modal-card" style={{ width: "100%", maxWidth: 440, padding: "32px 28px", position: "relative" }}>

            {/* Close */}
            <button
              onClick={() => setIsAddModalOpen(false)}
              style={{
                position: "absolute", top: 20, right: 20,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8, padding: 6, cursor: "pointer", color: "#71717a",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "#f87171"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#71717a"; }}
            >
              <X style={{ height: 15, width: 15 }} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: 22 }}>
              <div style={{
                height: 44, width: 44, borderRadius: 12, marginBottom: 14,
                background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <PackagePlus style={{ height: 20, width: 20, color: "#34d399" }} />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#f4f4f5", margin: 0 }}>Add New Asset</h2>
              <p style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>Enter the hardware details below.</p>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
                {/* Asset name */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>
                    Asset Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MacBook Pro M3"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="dark-input"
                  />
                </div>
                {/* Identifier */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>
                    Identifier / Tag
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAC-001"
                    value={newItem.identifier}
                    onChange={(e) => setNewItem({ ...newItem, identifier: e.target.value })}
                    className="dark-input"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
                {/* Category */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>
                    Category
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="dark-input dark-select"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    flex: 1, padding: "11px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "#a1a1aa", cursor: "pointer", transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-sm" style={{ flex: 1, padding: "11px 16px", justifyContent: "center" }}>
                  Add Asset
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