/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from "react";
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
  Pencil,
  Upload,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import { exportUsersToExcel, importUsersFromExcel } from "../utils/exportUtils";
import { useDebounce } from "../hooks/useDebounce";

import { DEPARTMENTS, STUDENT_DEPARTMENTS } from "../utils/constants";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    fullname: "",
    instituteEmail: "",
    phoneNumber: "",
    role: "Student",
    studentId: "",
    branch: "",
    alternativeEmail: "",
    phdGuide: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState("Admin");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [roleFilter, setRoleFilter] = useState("All");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = [];
      if (roleFilter !== "All") queryParams.push(`role=${roleFilter}`);
      const response = await api.get(`/users${queryParams.length ? '?' + queryParams.join('&') : ''}`);
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error("Failed to load user directory");
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  const filteredUsers = users.filter((user) => {
    if (!debouncedSearch) return true;
    const term = debouncedSearch.toLowerCase();
    return (
      user.fullname.toLowerCase().includes(term) ||
      user.instituteEmail.toLowerCase().includes(term)
    );
  });

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
      toast.error("Name, email, phone, and role are required.");
      return;
    }
    if (newUser.role === "Student" && !newUser.studentId) {
      toast.error("Student ID / Roll Number is required for Students.");
      return;
    }
    if ((newUser.role === "Student" || newUser.role === "Faculty" || newUser.role === "Staff") && !newUser.branch) {
      toast.error("Department is required for Students, Faculty, and Staff.");
      return;
    }

    try {
      setIsCreating(true);
      
      const userData = {
        fullname: newUser.fullname,
        instituteEmail: newUser.instituteEmail,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
      };

      if (newUser.role === "Student") {
        userData.studentId = newUser.studentId;
        userData.branch = newUser.branch;
        userData.alternativeEmail = newUser.alternativeEmail;
        userData.phdGuide = newUser.phdGuide;
      } else if (newUser.role === "Faculty") {
        userData.branch = newUser.branch;
        userData.alternativeEmail = newUser.alternativeEmail;
      } else if (["Admin", "Staff"].includes(newUser.role)) {
        userData.alternativeEmail = newUser.alternativeEmail;
        if (newUser.role === "Staff") {
          userData.branch = newUser.branch;
        }
      }

      await api.post("/users/add", userData);
      toast.success(`User ${newUser.fullname} has been added successfully.`);
      setIsAddModalOpen(false);
      setNewUser({ fullname: "", instituteEmail: "", phoneNumber: "", role: "Student", studentId: "", branch: "", alternativeEmail: "", phdGuide: "" });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editUser.fullname || !editUser.phoneNumber || !editUser.role) {
      toast.error("Name, phone number, and role are required.");
      return;
    }
    if (editUser.role === "Student" && !editUser.studentId) {
      toast.error("Student ID / Roll Number is required for Students.");
      return;
    }
    if (editUser.role === "Staff" && !editUser.employeeId) {
      toast.error("Employee ID is required for Staff.");
      return;
    }
    if ((editUser.role === "Student" || editUser.role === "Faculty" || editUser.role === "Staff") && !editUser.branch) {
      toast.error("Department is required for Students, Faculty, and Staff.");
      return;
    }

    try {
      setIsEditing(true);
      
      const updateData = {
        fullname: editUser.fullname,
        phoneNumber: editUser.phoneNumber,
        role: editUser.role,
      };

      // Role is Student - include student fields
      if (editUser.role === "Student") {
        updateData.studentId = editUser.studentId;
        updateData.branch = editUser.branch;
        updateData.alternativeEmail = editUser.alternativeEmail;
        updateData.phdGuide = editUser.phdGuide;
      }
      // Role is Faculty - include faculty fields
      else if (editUser.role === "Faculty") {
        updateData.branch = editUser.branch;
        updateData.alternativeEmail = editUser.alternativeEmail;
      }
      // Role is Admin/Staff - include staff fields
      else if (["Admin", "Staff"].includes(editUser.role)) {
        updateData.alternativeEmail = editUser.alternativeEmail;
        if (editUser.role === "Staff") {
          updateData.branch = editUser.branch;
          updateData.employeeId = editUser.employeeId;
        }
      }

      await api.put(`/users/${editUser._id}`, updateData);
      toast.success(`User ${editUser.fullname} has been updated successfully.`);
      setIsEditModalOpen(false);
      setEditUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user.");
    } finally {
      setIsEditing(false);
    }
  };

  const openEditModal = (user) => {
    setEditUser({
      _id: user._id,
      fullname: user.fullname,
      instituteEmail: user.instituteEmail,
      phoneNumber: user.phoneNumber || "",
      role: user.role,
      accountStatus: user.accountStatus,
      studentId: user.studentId || "",
      employeeId: user.employeeId || "",
      branch: user.branch || "",
      alternativeEmail: user.alternativeEmail || "",
      phdGuide: user.phdGuide || "",
    });
    setIsEditModalOpen(true);
  };

  const handleExportUsers = async () => {
    try {
      setIsExporting(true);
      await exportUsersToExcel(api, "users_export");
      toast.success("Users exported successfully");
    } catch (error) {
      toast.error("Failed to export users");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportUsers = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const result = await importUsersFromExcel(file, api);
      toast.success(`Imported ${result.success} of ${result.total} users`);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Failed to import users");
    } finally {
      setIsImporting(false);
      e.target.value = "";
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
            onClick={handleExportUsers}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--theme-panel)] text-[var(--theme-text)] text-sm font-medium rounded-xl hover:bg-[var(--theme-border)] transition-colors shadow-sm border border-[var(--theme-border)]"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 bg-[var(--theme-panel)] text-[var(--theme-text)] text-sm font-medium rounded-xl hover:bg-[var(--theme-border)] transition-colors shadow-sm border border-[var(--theme-border)] cursor-pointer">
            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportUsers}
              disabled={isImporting}
              className="hidden"
            />
          </label>

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
            onChange={(e) => setRoleFilter(e.target.value)}
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--theme-text-muted)]">
                    No users found.
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
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
                      ${user.role === "Student" ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" : ""}
                      ${user.role === "Staff" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : ""}
                      ${user.role === "Faculty" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""}
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
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/20"
                        >
                          Edit
                        </button>
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
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-4xl shadow-2xl max-w-lg w-full border border-[var(--theme-border)] relative animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="max-h-[85vh] overflow-y-auto">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] bg-[var(--theme-bg)] rounded-full transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-6 border-b border-[var(--theme-border)]">
                <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-3 border border-blue-500/20">
                  <UserPlus className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-[var(--theme-text)]">Add New User</h2>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Manually add a new user to the system.
                </p>
              </div>

              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                    Full Name <span className="text-red-500">*</span>
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
                    Institute Email <span className="text-red-500">*</span>
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
                    Phone Number <span className="text-red-500">*</span>
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
                    Role <span className="text-red-500">*</span>
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

                {/* Student-specific fields */}
                {newUser.role === "Student" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                        Student ID / Roll Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 21BCS001"
                        value={newUser.studentId}
                        onChange={(e) => setNewUser({ ...newUser, studentId: e.target.value })}
                        className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                        Department / Branch <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newUser.branch}
                        onChange={(e) => setNewUser({ ...newUser, branch: e.target.value })}
                        className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="">Select Department</option>
                        {STUDENT_DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                        Alternative Email
                      </label>
                      <input
                        type="email"
                        placeholder="personal@email.com"
                        value={newUser.alternativeEmail}
                        onChange={(e) => setNewUser({ ...newUser, alternativeEmail: e.target.value })}
                        className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                        PhD Guide Name
                      </label>
                      <input
                        type="text"
                        placeholder="Dr. Guide Name"
                        value={newUser.phdGuide}
                        onChange={(e) => setNewUser({ ...newUser, phdGuide: e.target.value })}
                        className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </>
                )}

                {/* Faculty-specific fields */}
                {newUser.role === "Faculty" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newUser.branch}
                        onChange={(e) => setNewUser({ ...newUser, branch: e.target.value })}
                        className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                        Alternative Email
                      </label>
                      <input
                        type="email"
                        placeholder="personal@email.com"
                        value={newUser.alternativeEmail}
                        onChange={(e) => setNewUser({ ...newUser, alternativeEmail: e.target.value })}
                        className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </>
                )}

                {/* Admin/Staff-specific fields */}
                {["Admin", "Staff"].includes(newUser.role) && (
                  <>
                    {newUser.role === "Staff" && (
                      <div>
                        <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newUser.branch}
                          onChange={(e) => setNewUser({ ...newUser, branch: e.target.value })}
                          className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        >
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                        Alternative Email
                      </label>
                      <input
                        type="email"
                        placeholder="personal@email.com"
                        value={newUser.alternativeEmail}
                        onChange={(e) => setNewUser({ ...newUser, alternativeEmail: e.target.value })}
                        className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </>
                )}

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
        </div>
      )}

      {isEditModalOpen && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-4xl shadow-2xl max-w-lg w-full border border-[var(--theme-border)] relative animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="max-h-[85vh] overflow-y-auto">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] bg-[var(--theme-bg)] rounded-full transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-6 border-b border-[var(--theme-border)]">
                <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-3 border border-blue-500/20">
                  <Pencil className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-[var(--theme-text)]">Edit User</h2>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Update user details. Fields change based on role.
                </p>
              </div>

              <form onSubmit={handleEditUser} className="p-6 space-y-4">
                {/* Read-only fields */}
                <div>
                  <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                    Institute Email
                  </label>
                  <input
                    type="email"
                    value={editUser.instituteEmail}
                    disabled
                    className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text-muted)] opacity-60 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                    Account Status
                  </label>
                  <select
                    value={editUser.accountStatus}
                    disabled
                    className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text-muted)] opacity-60 cursor-not-allowed"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Deactivated">Deactivated</option>
                  </select>
                </div>

                {/* Common fields */}
                <div>
                  <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={editUser.fullname}
                    onChange={(e) => setEditUser({ ...editUser, fullname: e.target.value })}
                    className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 234 567 8900"
                    value={editUser.phoneNumber}
                    onChange={(e) => setEditUser({ ...editUser, phoneNumber: e.target.value })}
                    className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="Student">Student</option>
                    <option value="Staff">Staff</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                {/* Student-specific fields */}
                {editUser.role === "Student" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                        Student ID / Roll Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 21BCS001"
                        value={editUser.studentId}
                        onChange={(e) => setEditUser({ ...editUser, studentId: e.target.value })}
                        className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                        Department / Branch <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editUser.branch}
                        onChange={(e) => setEditUser({ ...editUser, branch: e.target.value })}
                        className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="">Select Department</option>
                        {STUDENT_DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                        Alternative Email
                      </label>
                      <input
                        type="email"
                        placeholder="personal@email.com"
                        value={editUser.alternativeEmail}
                        onChange={(e) => setEditUser({ ...editUser, alternativeEmail: e.target.value })}
                        className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                        PhD Guide Name
                      </label>
                      <input
                        type="text"
                        placeholder="Dr. Guide Name"
                        value={editUser.phdGuide}
                        onChange={(e) => setEditUser({ ...editUser, phdGuide: e.target.value })}
                        className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </>
                )}

                {/* Faculty-specific fields */}
                {editUser.role === "Faculty" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editUser.branch}
                        onChange={(e) => setEditUser({ ...editUser, branch: e.target.value })}
                        className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                        Alternative Email
                      </label>
                      <input
                        type="email"
                        placeholder="personal@email.com"
                        value={editUser.alternativeEmail}
                        onChange={(e) => setEditUser({ ...editUser, alternativeEmail: e.target.value })}
                        className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </>
                )}

                {/* Admin/Staff-specific fields */}
                {["Admin", "Staff"].includes(editUser.role) && (
                  <>
                    {editUser.role === "Staff" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                            Employee ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Enter Employee ID"
                            value={editUser.employeeId}
                            onChange={(e) => setEditUser({ ...editUser, employeeId: e.target.value })}
                            className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                            Department <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={editUser.branch}
                            onChange={(e) => setEditUser({ ...editUser, branch: e.target.value })}
                            className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          >
                            <option value="">Select Department</option>
                            {DEPARTMENTS.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-[var(--theme-text-muted)] mb-1">
                        Alternative Email
                      </label>
                      <input
                        type="email"
                        placeholder="personal@email.com"
                        value={editUser.alternativeEmail}
                        onChange={(e) => setEditUser({ ...editUser, alternativeEmail: e.target.value })}
                        className="block w-full py-3 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-[var(--theme-text)] bg-[var(--theme-bg)] border border-[var(--theme-border)] hover:bg-[var(--theme-border)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEditing}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50"
                  >
                    {isEditing ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
