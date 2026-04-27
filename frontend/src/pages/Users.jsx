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
  MoreVertical,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Pagination from "../components/Pagination";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    fullname: "",
    instituteEmail: "",
    phoneNumber: "",
    role: "Student",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState("Admin");
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = [`page=${page}`, `limit=${limit}`];
      if (roleFilter !== "All") queryParams.push(`role=${roleFilter}`);
      const response = await api.get(`/users?${queryParams.join('&')}`);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to load user directory");
    } finally {
      setLoading(false);
    }
  }, [page, limit, roleFilter]);

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.instituteEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserRole(payload.role);
      } catch (e) {
        console.error("Could not decode token");
      }
    }

    fetchUsers();
  }, [fetchUsers]);

  // SUPER ADMIN ONLY: Demote an admin back to a standard user
  const handleDemoteRole = async (userId, currentName) => {
    if (currentUserRole !== "Super Admin") return; // Double-check safety

    // In a real app, you'd use a custom modal, but a confirm box is great for testing
    if (
      !window.confirm(
        `Are you sure you want to demote ${currentName} to a regular Staff member? They will lose dashboard access.`,
      )
    )
      return;

    try {
      await api.put(`/admin/users/${userId}/role`, { role: "Staff" });
      toast.success(`${currentName} has been demoted.`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change role");
    }
  };

  // SUPER ADMIN ONLY: Approve or Reject pending accounts
  const handleReviewUser = async (userId, action) => {
    if (currentUserRole !== "Super Admin") return;
    try {
      // Send "Approved" or "Rejected" to your backend review route
      await api.put(`/admin/requests/${userId}`, { status: action });
      toast.success(`User has been ${action.toLowerCase()}.`);
      fetchUsers(); // Refresh the table
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update user status",
      );
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (currentUserRole !== "Super Admin") return;
    if (!window.confirm(`Are you sure you want to permanently delete user ${userName}? This action cannot be undone.`)) return;

    try {
      await api.delete(`/users/${userId}`);
      toast.success(`${userName} has been deleted.`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.fullname || !newUser.instituteEmail || !newUser.phoneNumber || !newUser.role) {
      toast.error("All fields are required.");
      return;
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

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-text)] tracking-tight">
            Institution Directory
          </h1>
          <p className="text-sm text-[var(--theme-text-muted)] mt-1">
            Manage staff, students, and system access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1E] text-white text-sm font-medium rounded-xl hover:bg-black transition-colors shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>

          {/* Visual indicator of your current power level */}
          <div
            className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium border
            ${
              currentUserRole === "Super Admin"
                ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                : "bg-blue-500/10 text-blue-500 border-blue-500/20"
            }`}
          >
            {currentUserRole === "Super Admin" ? (
              <ShieldAlert className="h-4 w-4" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Logged in as: {currentUserRole}
          </div>
        </div>
      </div>

      {/* The Frosted Glass Table Wrapper */}
      <div className="bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-4xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--theme-border)] flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <select 
            value={roleFilter} 
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="sm:w-48 p-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="All">All Roles</option>
            <option value="Student">Student</option>
            <option value="Staff">Staff</option>
            <option value="Faculty">Faculty</option>
            <option value="Admin">Admin</option>
            <option value="Super Admin">Super Admin</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--theme-bg)] border-b border-[var(--theme-border)]">
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Name
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Contact
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  System Role
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">
                  Account Status
                </th>

                {/* CONDITIONAL COLUMN: Only Super Admins see this header */}
                {currentUserRole === "Super Admin" && (
                  <th className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)] text-right">
                    Admin Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--theme-border)]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--theme-text-muted)]">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-[var(--theme-bg)] transition-colors"
                >
                  <td className="py-4 px-6">
                    <Link
                      to={`/dashboard/users/${user._id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="h-10 w-10 rounded-full bg-[var(--theme-bg)] flex items-center justify-center text-[var(--theme-text)] font-bold text-sm border border-[var(--theme-border)] shadow-sm group-hover:scale-105 transition-transform">
                        {user.fullname.charAt(0)}
                      </div>
                      <span className="font-medium text-[var(--theme-text)] group-hover:text-blue-500 transition-colors">
                        {user.fullname}
                      </span>
                    </Link>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-[var(--theme-text-muted)]">
                      <Mail className="h-4 w-4 text-[var(--theme-text-muted)] opacity-70" />
                      {user.instituteEmail}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                      ${user.role === "Super Admin" ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" : ""}
                      ${user.role === "Admin" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : ""}
                      ${["Student", "Staff", "Faculty"].includes(user.role) ? "bg-gray-500/10 text-gray-500 border-gray-500/20" : ""}
                    `}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                      ${user.accountStatus === "Approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""}
                      ${user.accountStatus === "Pending" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : ""}
                      ${user.accountStatus === "Deactivated" ? "bg-red-500/10 text-red-500 border-red-500/20" : ""}
                    `}
                    >
                      {user.accountStatus}
                    </span>
                  </td>

                  {/* CONDITIONAL ACTIONS: Only Super Admins can click these */}
                  {currentUserRole === "Super Admin" && (
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {user.accountStatus === "Pending" ? (
                          <>
                            <button
                              onClick={() => handleReviewUser(user._id, "Approved")}
                              className="text-sm text-emerald-500 hover:text-emerald-400 font-medium transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewUser(user._id, "Rejected")}
                              className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20"
                            >
                              Reject
                            </button>
                          </>
                        ) : user.accountStatus === "Approved" && user.role === "Admin" ? (
                          <button
                            onClick={() => handleDemoteRole(user._id, user.fullname)}
                            className="text-sm text-orange-500 hover:text-orange-400 font-medium transition-colors bg-orange-500/10 hover:bg-orange-500/20 px-3 py-1.5 rounded-lg border border-orange-500/20"
                          >
                            Revoke Admin
                          </button>
                        ) : (
                          <span className="text-gray-300 text-sm italic hidden">No actions</span>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user._id, user.fullname)}
                          className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={handleLimitChange} loading={loading} />
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-4xl shadow-2xl max-w-md w-full p-8 border border-[var(--theme-border)] relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] bg-[var(--theme-bg)] rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <div className="h-12 w-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                <UserPlus className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-[var(--theme-text)]">Add New User</h2>
              <p className="text-sm text-[var(--theme-text-muted)] mt-1">
                Manually add a new user to the system.
              </p>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={newUser.fullname}
                  onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })}
                  className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                  Institute Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="john.doe@institute.edu"
                  value={newUser.instituteEmail}
                  onChange={(e) => setNewUser({ ...newUser, instituteEmail: e.target.value })}
                  className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 234 567 8900"
                  value={newUser.phoneNumber}
                  onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                  className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="Student">Student</option>
                  <option value="Staff">Staff</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-[var(--theme-text)] bg-[var(--theme-bg)] border border-[var(--theme-border)] hover:bg-[var(--theme-border)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create User"}
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
