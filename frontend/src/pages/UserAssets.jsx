import { useState, useEffect } from "react";
import { Users as UsersIcon, Package, Loader2, Search, Download, Filter, User, X, History, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import { exportToExcel } from "../utils/exportUtils";

const UserAssets = () => {
  const [users, setUsers] = useState([]);
  const [issuedAssets, setIssuedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showUsersWithItems, setShowUsersWithItems] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const DEPARTMENTS = [
    "Chemical & Biochemical Engineering",
    "Chemistry",
    "Civil & Environmental Engineering",
    "Computer Science and Engineering",
    "Electrical Engineering",
    "Humanities & Social Sciences",
    "Mathematics",
    "Mechanical Engineering",
    "Metallurgical and Materials Engineering",
    "Physics"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, issuedRes] = await Promise.all([
        api.get("/users"),
        api.get("/items/issued")
      ]);
      setUsers(usersRes.data.users || []);
      setIssuedAssets(issuedRes.data.issuedAssets || []);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHistory = async (user) => {
    setSelectedUser(user);
    setLoadingHistory(true);
    setShowHistory(true);
    try {
      const res = await api.get(`/users/${user._id}/history`);
      setUserHistory(res.data.history || []);
    } catch (error) {
      toast.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const userIssuedMap = {};
  issuedAssets.forEach(asset => {
    const userId = asset.user?._id || asset.user;
    if (userId) {
      if (!userIssuedMap[userId]) {
        userIssuedMap[userId] = [];
      }
      userIssuedMap[userId].push(asset);
    }
  });

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesDepartment = departmentFilter === "All" || user.branch === departmentFilter;
    const matchesSearch = !searchTerm || 
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.instituteEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const userItems = userIssuedMap[user._id] || [];
    const hasItems = userItems.length > 0;
    const matchesItemsFilter = !showUsersWithItems || hasItems;
    return matchesRole && matchesSearch && matchesItemsFilter && matchesDepartment;
  });

  const handleExport = () => {
    setExporting(true);
    try {
      const exportData = [];
      
      filteredUsers.forEach(user => {
        const userItems = userIssuedMap[user._id] || [];
        
        if (userItems.length > 0) {
          userItems.forEach(item => {
            exportData.push({
              "User Name": user.fullname,
              "Email": user.instituteEmail,
              "Role": user.role,
              "Item Name": item.catalogItem?.name || "Unknown",
              "Identifier": item.identifier,
              "Issue Date": item.issuedAt ? new Date(item.issuedAt).toLocaleDateString() : "",
            });
          });
        } else {
          exportData.push({
            "User Name": user.fullname,
            "Email": user.instituteEmail,
            "Role": user.role,
            "Item Name": "",
            "Identifier": "",
            "Issue Date": "",
          });
        }
      });

      exportToExcel(exportData, "user_assets_report", "User Assets");
      toast.success("Export successful");
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const roles = ["All", "Student", "Faculty", "Staff", "Admin", "Super Admin"];

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">User Assets</h1>
          <p className="text-sm text-[var(--theme-text-muted)] mt-1">
            View and export users with their assigned items
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export to Excel
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text-muted)]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--theme-text-muted)]" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {roles.map(role => (
              <option key={role} value={role}>{role === "All" ? "All Roles" : role}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--theme-text-muted)]" />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2.5 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={showUsersWithItems}
                onChange={(e) => setShowUsersWithItems(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--theme-border)] rounded-full peer peer-checked:bg-blue-500 transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
            <span className="text-sm text-[var(--theme-text)]">With items only</span>
          </label>
        </div>
      </div>

      <div className="bg-[var(--theme-panel)] rounded-2xl border border-[var(--theme-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--theme-bg)] border-b border-[var(--theme-border)]">
                <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)]">User</th>
                <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)]">Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)]">Items Assigned</th>
                <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)]">Item Details</th>
                <th className="px-6 py-4 text-sm font-semibold text-[var(--theme-text-muted)]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--theme-border)]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--theme-text-muted)]">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const userItems = userIssuedMap[user._id] || [];
                  return (
                    <tr key={user._id} className="hover:bg-[var(--theme-bg)]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <div className="font-medium text-[var(--theme-text)]">{user.fullname}</div>
                            <div className="text-sm text-[var(--theme-text-muted)]">{user.instituteEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === "Super Admin" ? "bg-purple-500/20 text-purple-400" :
                          user.role === "Admin" ? "bg-blue-500/20 text-blue-400" :
                          user.role === "Faculty" ? "bg-green-500/20 text-green-400" :
                          user.role === "Staff" ? "bg-amber-500/20 text-amber-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${userItems.length > 0 ? "text-green-500" : "text-[var(--theme-text-muted)]"}`}>
                          {userItems.length} item{userItems.length !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {userItems.length > 0 ? (
                          <div className="space-y-2">
                            {(expandedUser === user._id ? userItems : userItems.slice(0, 2)).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <Package className="h-4 w-4 text-[var(--theme-text-muted)]" />
                                <span className="text-[var(--theme-text)]">{item.catalogItem?.name}</span>
                                <span className="text-[var(--theme-text-muted)] font-mono">({item.identifier})</span>
                              </div>
                            ))}
                            {userItems.length > 2 && (
                              <button
                                onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                                className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                              >
                                {expandedUser === user._id ? (
                                  <>Show less <ChevronUp className="h-4 w-4" /></>
                                ) : (
                                  <>+{userItems.length - 2} more <ChevronDown className="h-4 w-4" /></>
                                )}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[var(--theme-text-muted)]">No items</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => fetchUserHistory(user)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--theme-bg)] text-[var(--theme-text)] rounded-lg text-sm font-medium hover:bg-[var(--theme-border)]"
                        >
                          <History className="h-4 w-4" />
                          History
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showHistory && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--theme-panel)] rounded-[2rem] shadow-2xl max-w-lg w-full p-6 relative border border-[var(--theme-border)] max-h-[80vh] overflow-y-auto">
            <button onClick={() => setShowHistory(false)} className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-full">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">{selectedUser.fullname}</h2>
            <p className="text-sm text-[var(--theme-text-muted)] mb-4">Activity History</p>
            
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : userHistory.length === 0 ? (
              <p className="text-[var(--theme-text-muted)]">No recorded history</p>
            ) : (
              <div className="relative border-l-2 border-[var(--theme-border)] ml-3 space-y-6 pb-2">
                {userHistory.map((log) => (
                  <div key={log._id} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-[var(--theme-panel)] border-2 border-blue-500"></div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--theme-text-muted)] mb-1">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      <span className="text-sm font-semibold text-[var(--theme-text)] mb-1">
                        {log.action}
                      </span>
                      <span className="text-sm text-[var(--theme-text-muted)] font-mono">
                        Asset: {log.notes || 'Unknown'}
                      </span>
                      <span className="text-xs text-[var(--theme-text-muted)] opacity-70 mt-1">
                        Authorized by: {log.authorizedBy?.fullname || 'System'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAssets;
