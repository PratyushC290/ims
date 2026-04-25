/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Users as UsersIcon,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Loader2,
  Search,
  UserPlus,
  X,
  CheckCircle,
  XCircle,
  ShieldOff,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Pagination from "../components/Pagination";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .usr-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

  @keyframes usr-fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes usr-row-in {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes modal-in {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes overlay-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .usr-card {
    background: rgba(20,20,24,0.95);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03);
  }

  .usr-header-animate { animation: usr-fade-up 0.45s cubic-bezier(.16,1,.3,1) both; }
  .usr-card-animate   { animation: usr-fade-up 0.5s  cubic-bezier(.16,1,.3,1) 0.08s both; }

  .usr-row {
    transition: background 0.15s ease;
    animation: usr-row-in 0.35s cubic-bezier(.16,1,.3,1) both;
  }
  .usr-row:hover { background: rgba(255,255,255,0.03) !important; }

  .usr-th {
    padding: 13px 20px;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.07em; text-transform: uppercase;
    color: #52525b;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    white-space: nowrap;
  }
  .usr-td {
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    vertical-align: middle;
  }

  .dark-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: #e4e4e7; font-size: 13px;
    padding: 10px 14px; outline: none;
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
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
    padding-right: 36px !important;
  }
  .dark-select option { background: #141418; color: #e4e4e7; }

  .btn-primary-sm {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    color: #fff; font-size: 13px; font-weight: 600;
    border: none; border-radius: 10px; cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
    box-shadow: 0 4px 14px rgba(79,70,229,0.3);
  }
  .btn-primary-sm:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,0.45); filter: brightness(1.08); }
  .btn-primary-sm:active { transform: translateY(0) scale(0.97); }
  .btn-primary-sm:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .btn-ghost-sm {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; font-size: 12px; font-weight: 500;
    border-radius: 8px; cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
    border: 1px solid transparent;
  }

  .action-approve { background: rgba(16,185,129,0.1); color: #34d399; border-color: rgba(16,185,129,0.2); }
  .action-approve:hover { background: rgba(16,185,129,0.2); }
  .action-reject  { background: rgba(239,68,68,0.1);  color: #f87171; border-color: rgba(239,68,68,0.2); }
  .action-reject:hover  { background: rgba(239,68,68,0.18); }
  .action-revoke  { background: rgba(239,68,68,0.1);  color: #f87171; border-color: rgba(239,68,68,0.2); }
  .action-revoke:hover  { background: rgba(239,68,68,0.18); }

  .avatar-circle {
    height: 36px; width: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700;
    background: linear-gradient(135deg, rgba(37,99,235,0.25) 0%, rgba(79,70,229,0.25) 100%);
    border: 1px solid rgba(37,99,235,0.25);
    color: #93c5fd; flex-shrink: 0;
    transition: transform 0.2s ease;
  }
  .usr-row:hover .avatar-circle { transform: scale(1.08); }

  .role-superadmin { background: rgba(99,102,241,0.12); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.25); }
  .role-admin      { background: rgba(37,99,235,0.12);  color: #60a5fa; border: 1px solid rgba(37,99,235,0.25); }
  .role-standard   { background: rgba(113,113,122,0.12);color: #a1a1aa; border: 1px solid rgba(113,113,122,0.2); }

  .status-approved     { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
  .status-pending      { background: rgba(251,146,60,0.12); color: #fb923c; border: 1px solid rgba(251,146,60,0.2); }
  .status-deactivated  { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

  .role-indicator {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 7px 14px; border-radius: 10px; font-size: 12px; font-weight: 600;
  }

  .modal-overlay { animation: overlay-in 0.2s ease both; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); }
  .modal-card {
    animation: modal-in 0.28s cubic-bezier(.16,1,.3,1) both;
    background: #141418;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 22px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03);
  }
`;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ fullname: "", instituteEmail: "", phoneNumber: "", role: "Student" });
  const [isCreating, setIsCreating] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState("Admin");
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users?page=${page}&limit=${limit}`);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to load user directory");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const handleLimitChange = (newLimit) => { setLimit(newLimit); setPage(1); };

  const filteredUsers = users.filter(
    (user) =>
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.instituteEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserRole(payload.role);
      } catch (e) { console.error("Could not decode token"); }
    }
    fetchUsers();
  }, [fetchUsers]);

  const handleDemoteRole = async (userId, currentName) => {
    if (currentUserRole !== "Super Admin") return;
    if (!window.confirm(`Are you sure you want to demote ${currentName} to a regular Staff member? They will lose dashboard access.`)) return;
    try {
      await api.put(`/admin/users/${userId}/role`, { role: "Staff" });
      toast.success(`${currentName} has been demoted.`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change role");
    }
  };

  const handleReviewUser = async (userId, action) => {
    if (currentUserRole !== "Super Admin") return;
    try {
      await api.put(`/admin/requests/${userId}`, { status: action });
      toast.success(`User has been ${action.toLowerCase()}.`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user status");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.fullname || !newUser.instituteEmail || !newUser.phoneNumber || !newUser.role) {
      toast.error("All fields are required."); return;
    }
    try {
      setIsCreating(true);
      await api.post("/users/add", newUser);
      toast.success(`User ${newUser.fullname} has been added successfully.`);
      setIsAddModalOpen(false);
      setNewUser({ fullname: "", instituteEmail: "", phoneNumber: "", role: "Student" });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user.");
    } finally {
      setIsCreating(false);
    }
  };

  const roleBadge = (role) => {
    const cls = role === "Super Admin" ? "role-superadmin" : role === "Admin" ? "role-admin" : "role-standard";
    return (
      <span className={cls} style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
        {role}
      </span>
    );
  };

  const statusBadge = (status) => {
    const cls = status === "Approved" ? "status-approved" : status === "Pending" ? "status-pending" : "status-deactivated";
    const dot = status === "Approved" ? "#34d399" : status === "Pending" ? "#fb923c" : "#f87171";
    return (
      <span className={cls} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
        <span style={{ height: 6, width: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="usr-root h-full w-full flex items-center justify-center" style={{ minHeight: 300 }}>
        <style>{css}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ height: 32, width: 32, border: "2.5px solid rgba(96,165,250,0.2)", borderTopColor: "#60a5fa", borderRadius: "50%", animation: "spin 0.85s linear infinite" }} />
          <p style={{ color: "#52525b", fontSize: 13 }}>Loading directory…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="usr-root" style={{ maxWidth: 1280, margin: "0 auto" }}>
      <style>{css}</style>

      {/* ── Header ── */}
      <div className="usr-header-animate" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f4f4f5", margin: 0, letterSpacing: "-0.01em" }}>
            Institution Directory
          </h1>
          <p style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>
            Manage staff, students, and system access.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            className="role-indicator"
            style={currentUserRole === "Super Admin"
              ? { background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }
              : { background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)", color: "#60a5fa" }}
          >
            {currentUserRole === "Super Admin"
              ? <ShieldAlert style={{ height: 14, width: 14 }} />
              : <ShieldCheck style={{ height: 14, width: 14 }} />}
            {currentUserRole}
          </div>
          <button className="btn-primary-sm" onClick={() => setIsAddModalOpen(true)}>
            <UserPlus style={{ height: 15, width: 15 }} />
            Add User
          </button>
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="usr-card usr-card-animate">
        {/* Toolbar */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", width: 280 }}>
            <Search style={{ height: 14, width: 14, color: "#52525b", position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dark-input"
              style={{ paddingLeft: 34 }}
            />
          </div>
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} style={{ fontSize: 12, color: "#71717a", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <X style={{ height: 12, width: 12 }} /> Clear
            </button>
          )}
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#3f3f46" }}>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Name", "Contact", "System Role", "Account Status", ...(currentUserRole === "Super Admin" ? ["Admin Actions"] : [])].map((h, i, arr) => (
                  <th key={h} className="usr-th" style={{ textAlign: i === arr.length - 1 && currentUserRole === "Super Admin" ? "right" : "left" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={currentUserRole === "Super Admin" ? 5 : 4} style={{ padding: "52px 20px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                      <div style={{ height: 44, width: 44, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <UsersIcon style={{ height: 20, width: 20, color: "#52525b" }} />
                      </div>
                      <p style={{ color: "#52525b", fontSize: 13 }}>No users match your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={user._id} className="usr-row" style={{ animationDelay: `${idx * 0.03}s` }}>
                    {/* Name */}
                    <td className="usr-td">
                      <Link to={`/dashboard/users/${user._id}`} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
                        <div className="avatar-circle">{user.fullname.charAt(0)}</div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7", transition: "color 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#93c5fd"}
                          onMouseLeave={e => e.currentTarget.style.color = "#e4e4e7"}>
                          {user.fullname}
                        </span>
                      </Link>
                    </td>
                    {/* Contact */}
                    <td className="usr-td">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Mail style={{ height: 13, width: 13, color: "#52525b", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#71717a", fontFamily: "'JetBrains Mono', monospace" }}>{user.instituteEmail}</span>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="usr-td">{roleBadge(user.role)}</td>
                    {/* Status */}
                    <td className="usr-td">{statusBadge(user.accountStatus)}</td>
                    {/* Actions */}
                    {currentUserRole === "Super Admin" && (
                      <td className="usr-td" style={{ textAlign: "right" }}>
                        {user.accountStatus === "Pending" ? (
                          <div style={{ display: "inline-flex", gap: 6 }}>
                            <button className="btn-ghost-sm action-approve" onClick={() => handleReviewUser(user._id, "Approved")}>
                              <CheckCircle style={{ height: 13, width: 13 }} /> Approve
                            </button>
                            <button className="btn-ghost-sm action-reject" onClick={() => handleReviewUser(user._id, "Rejected")}>
                              <XCircle style={{ height: 13, width: 13 }} /> Reject
                            </button>
                          </div>
                        ) : user.accountStatus === "Approved" && user.role === "Admin" ? (
                          <button className="btn-ghost-sm action-revoke" onClick={() => handleDemoteRole(user._id, user.fullname)}>
                            <ShieldOff style={{ height: 13, width: 13 }} /> Revoke Admin
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: "#3f3f46", fontStyle: "italic" }}>No actions</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={handleLimitChange} loading={loading} />
        </div>
      </div>

      {/* ══════════ ADD USER MODAL ══════════ */}
      {isAddModalOpen && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="modal-card" style={{ width: "100%", maxWidth: 440, padding: "32px 28px", position: "relative" }}>
            {/* Close */}
            <button
              onClick={() => setIsAddModalOpen(false)}
              style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 6, cursor: "pointer", color: "#71717a", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s, color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "#f87171"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#71717a"; }}
            >
              <X style={{ height: 15, width: 15 }} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ height: 44, width: 44, borderRadius: 12, marginBottom: 14, background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserPlus style={{ height: 20, width: 20, color: "#60a5fa" }} />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#f4f4f5", margin: 0 }}>Add New User</h2>
              <p style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>Manually add a new user to the system.</p>
            </div>

            <form onSubmit={handleAddUser}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
                {[
                  { label: "Full Name", key: "fullname", type: "text", placeholder: "John Doe" },
                  { label: "Institute Email", key: "instituteEmail", type: "email", placeholder: "john.doe@institute.edu" },
                  { label: "Phone Number", key: "phoneNumber", type: "tel", placeholder: "+1 234 567 8900" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>{label}</label>
                    <input type={type} required placeholder={placeholder} value={newUser[key]}
                      onChange={(e) => setNewUser({ ...newUser, [key]: e.target.value })}
                      className="dark-input" />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>Role</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="dark-input dark-select">
                    <option value="Student">Student</option>
                    <option value="Staff">Staff</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)}
                  style={{ flex: 1, padding: "11px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-sm" disabled={isCreating} style={{ flex: 1, padding: "11px 16px", justifyContent: "center" }}>
                  {isCreating ? "Creating…" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;