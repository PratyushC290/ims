import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MonitorSmartphone,
  Users,
  LogOut,
  Bell,
  CheckCheck,
  History,
} from "lucide-react";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import api from "../api";

const Layout = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    {
      name: "Inventory",
      path: "/dashboard/inventory",
      icon: MonitorSmartphone,
    },
    { name: "Directory", path: "/dashboard/users", icon: Users },
    { name: "Audit Logs", path: "/dashboard/audit-logs", icon: History },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const fetchNotifications = async () => {
    try {
      const [notifRes, historyRes] = await Promise.all([
        api.get("/notifications"),
        api.get("/history/latest"),
      ]);

      const adminNotifs = notifRes.data.notifications || [];
      const recentActivity = historyRes.data.logs || [];

      setUnreadCount(notifRes.data.unreadCount || 0);

      const activityNotifications = recentActivity.map((log) => ({
        _id: log._id,
        type: "activity",
        title: formatActivityTitle(log),
        message: formatActivityMessage(log),
        createdAt: log.createdAt,
        isRead: false,
      }));

      setNotifications([...activityNotifications, ...adminNotifs]);
    } catch {
      console.error("Failed to fetch notifications");
    }
  };

  const formatActivityTitle = (log) => {
    const action = log.action || "";
    return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
  };

  const formatActivityMessage = (log) => {
    const itemName = log.item?.name || "Unknown Item";
    const userName = log.targetUser?.fullname || "Unknown User";
    const action = log.action || "";

    if (action === "Assigned") {
      return `${itemName} assigned to ${userName}`;
    } else if (action === "Returned") {
      return `${itemName} returned by ${userName}`;
    } else if (action === "Sent to Maintenance") {
      return `${itemName} sent for maintenance`;
    } else if (action === "Removed from Maintenance") {
      return `${itemName} removed from maintenance`;
    }
    return `${itemName} - ${action}`;
  };

  useEffect(() => {
    const loadNotifications = async () => {
      await fetchNotifications();
    };
    loadNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "pendingUser":
        return "bg-blue-500";
      case "maintenanceAlert":
        return "bg-amber-500";
      case "activity":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex">
      {/* SIDEBAR: Frosted Glass Panel */}
      <aside className="w-64 fixed inset-y-0 left-0 z-50 flex flex-col bg-[#141418]/80 backdrop-blur-xl border-r border-zinc-800/50 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 bg-zinc-900 rounded-xl shadow-sm flex items-center justify-center border border-zinc-800">
            <MonitorSmartphone className="h-5 w-5 text-zinc-100" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            IMS Portal
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? "bg-zinc-800/50 shadow-sm border border-zinc-700/50 text-blue-400"
                    : "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? "text-blue-400" : "text-zinc-500"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors font-medium"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* TOP HEADER: Frosted Glass */}
        <header className="h-20 px-8 flex items-center justify-end sticky top-0 z-40 bg-[#141418]/80 backdrop-blur-md border-b border-zinc-800/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) fetchNotifications();
                }}
                className="p-2.5 bg-zinc-900 rounded-full shadow-sm border border-zinc-800 text-zinc-400 hover:text-blue-400 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-zinc-900"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-[#141418]/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-100">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                      >
                        <CheckCheck className="h-3 w-3" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-sm text-zinc-500 text-center">
                        Loading...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-sm text-zinc-500 text-center">
                        No notifications
                      </div>
                    ) : (
                      <div className="divide-y divide-zinc-800/50">
                        {notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 hover:bg-zinc-800/30 transition-colors ${
                              !notification.isRead ? "bg-blue-500/10" : ""
                            }`}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${getNotificationColor(notification.type)}`}
                              ></div>
                              <div>
                                <p className="text-sm font-medium text-zinc-200">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-zinc-400 mt-0.5">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-zinc-600 mt-1">
                                  {new Date(
                                    notification.createdAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="h-10 w-10 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 shadow-sm border-2 border-zinc-800 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
          </div>
        </header>

        {/* PAGE CONTENT: This is where your Dashboard, Inventory, etc. will render */}
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
