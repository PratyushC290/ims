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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Institution Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
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
                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
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
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-4 border-b border-gray-100/50">
          <div className="relative w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/40 border-b border-gray-100">
                <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                  Name
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                  Contact
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                  System Role
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                  Account Status
                </th>

                {/* CONDITIONAL COLUMN: Only Super Admins see this header */}
                {currentUserRole === "Super Admin" && (
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500 text-right">
                    Admin Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-white/40 transition-colors"
                >
                  <td className="py-4 px-6">
                    <Link
                      to={`/dashboard/users/${user._id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="h-10 w-10 rounded-full bg-linear-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm border border-white shadow-sm group-hover:scale-105 transition-transform">
                        {user.fullname.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {user.fullname}
                      </span>
                    </Link>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {user.instituteEmail}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                      ${user.role === "Super Admin" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : ""}
                      ${user.role === "Admin" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                      ${["Student", "Staff", "Faculty"].includes(user.role) ? "bg-gray-50 text-gray-700 border-gray-200" : ""}
                    `}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                      ${user.accountStatus === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                      ${user.accountStatus === "Pending" ? "bg-orange-50 text-orange-700 border-orange-200" : ""}
                      ${user.accountStatus === "Deactivated" ? "bg-red-50 text-red-700 border-red-200" : ""}
                    `}
                    >
                      {user.accountStatus}
                    </span>
                  </td>

                  {/* CONDITIONAL ACTIONS: Only Super Admins can click these */}
                  {currentUserRole === "Super Admin" && (
                    <td className="py-4 px-6 text-right space-x-2">
                      {/* SCENARIO 1: The user is waiting for approval */}
                      {user.accountStatus === "Pending" ? (
                        <>
                          <button
                            onClick={() =>
                              handleReviewUser(user._id, "Approved")
                            }
                            className="text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-100"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleReviewUser(user._id, "Rejected")
                            }
                            className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-100"
                          >
                            Reject
                          </button>
                        </>
                      ) : /* SCENARIO 2: They are approved AND they are an Admin (can be demoted) */
                      user.accountStatus === "Approved" &&
                        user.role === "Admin" ? (
                        <button
                          onClick={() =>
                            handleDemoteRole(user._id, user.fullname)
                          }
                          className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-100"
                        >
                          Revoke Admin
                        </button>
                      ) : (
                        /* SCENARIO 3: Everyone else (Standard users, other Super Admins, or Rejected) */
                        <span className="text-gray-300 text-sm italic">
                          No actions
                        </span>
                      )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 border border-white relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
                <UserPlus className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manually add a new user to the system.
              </p>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={newUser.fullname}
                  onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })}
                  className="block w-full py-3 px-4 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institute Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="john.doe@institute.edu"
                  value={newUser.instituteEmail}
                  onChange={(e) => setNewUser({ ...newUser, instituteEmail: e.target.value })}
                  className="block w-full py-3 px-4 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 234 567 8900"
                  value={newUser.phoneNumber}
                  onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                  className="block w-full py-3 px-4 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="block w-full py-3 px-4 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
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
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
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
