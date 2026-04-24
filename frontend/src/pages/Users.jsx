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
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Pagination from "../components/Pagination";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
    </div>
  );
};

export default Users;
