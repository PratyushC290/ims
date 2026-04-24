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
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Pagination from "../components/Pagination";

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
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredUsers = users
    .filter((u) => u.accountStatus === "Approved")
    .filter(
      (u) =>
        u.fullname.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.instituteEmail.toLowerCase().includes(userSearch.toLowerCase())
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
      await api.put(`/items/${selectedItem._id}/assign`, {
        userId: selectedUserId,
      });
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
    if (
      !window.confirm(
        `Are you sure you want to log the return of ${item.name}?`,
      )
    )
      return;

    try {
      await api.put(`/items/${item._id}/return`);
      toast.success("Item successfully returned to inventory.");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to return item");
    }
  };

  const handleMaintenance = async (item) => {
    const actionText =
      item.status === "Under Maintenance"
        ? "mark as repaired"
        : "send to maintenance";
    if (!window.confirm(`Are you sure you want to ${actionText} this item?`))
      return;

    try {
      await api.put(`/items/${item._id}/maintenance`);
      toast.success(`Maintenance status updated.`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update maintenance status");
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
    <div className="space-y-6 max-w-7xl mx-auto relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Hardware Inventory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track, assign, and maintain institutional assets.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1E] text-white text-sm font-medium rounded-xl hover:bg-black transition-colors shadow-sm"
        >
          <PackagePlus className="h-4 w-4" />
          Add Asset
        </button>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-4 border-b border-gray-100/50 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/40 border-b border-gray-100">
                <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                  Asset Name
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                  ID Tag
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                  Category
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                  Status
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                  Assigned To
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No assets found matching your search.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-white/40 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                        <MonitorSmartphone className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm font-mono text-gray-500">
                    {item.identifier}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {item.category}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                      ${item.status === "Available" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                      ${item.status === "Assigned" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                      ${item.status === "Under Maintenance" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                    `}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700">
                    {item.assignedTo ? (
                      item.assignedTo.fullname
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right space-x-2">
                    {item.status === "Available" && (
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsAssignModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        <UserPlus className="h-4 w-4" /> Assign
                      </button>
                    )}

                    {item.status === "Assigned" && (
                      <button
                        onClick={() => handleReturn(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" /> Return
                      </button>
                    )}

                    <button
                      onClick={() => handleMaintenance(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border
                        ${
                          item.status === "Under Maintenance"
                            ? "text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-200"
                            : "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
                        }
                      `}
                    >
                      <Wrench className="h-4 w-4" />
                      {item.status === "Under Maintenance" ? "Fix" : "Maint"}
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={handleLimitChange} loading={loading} />
      </div>

      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-4xl shadow-2xl max-w-md w-full p-8 border border-white relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => {
                setIsAssignModalOpen(false);
                setSelectedItem(null);
                setSelectedUserId("");
                setUserSearch("");
              }}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
                <UserPlus className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Assign Hardware
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Issuing{" "}
                <span className="font-semibold text-gray-900">
                  {selectedItem?.name}
                </span>{" "}
                ({selectedItem?.identifier})
              </p>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50/30">
                  {filteredUsers.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      No users found.
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <label
                        key={user._id}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-blue-50/50 border-b border-gray-100 last:border-b-0 ${
                          selectedUserId === user._id ? "bg-blue-50" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedUser"
                          value={user._id}
                          checked={selectedUserId === user._id}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullname}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.instituteEmail}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAssignModalOpen(false);
                    setSelectedUserId("");
                    setUserSearch("");
                  }}
                  className="flex-1 py-3.5 px-4 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 px-4 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-4xl shadow-2xl max-w-md w-full p-8 border border-white relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100">
                <PackagePlus className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Add New Asset</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the hardware details below.
              </p>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro M3"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="block w-full py-3 px-4 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identifier / Tag
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MAC-001"
                  value={newItem.identifier}
                  onChange={(e) =>
                    setNewItem({ ...newItem, identifier: e.target.value })
                  }
                  className="block w-full py-3 px-4 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                  className="block w-full py-3 px-4 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Networking">Networking</option>
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
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
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