// edited by abhiram parupudi 2401cs21
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MonitorSmartphone,
  Users,
  LogOut,
  Bell,
  CheckCheck,
  History,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import api from "../api";

const Layout = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
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
    setConfirmModal({ isOpen: true });
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    setConfirmModal({ isOpen: false });
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
    // Dynamic background wrapping the entire screen
    <div className="min-h-screen bg-[var(--theme-bg)] flex transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-64 fixed inset-y-0 left-0 z-50 flex flex-col bg-[var(--theme-panel)] border-r border-[var(--theme-border)] shadow-sm transition-colors duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 bg-[var(--theme-bg)] rounded-xl shadow-sm flex items-center justify-center border border-[var(--theme-border)]">
            <MonitorSmartphone className="h-5 w-5 text-[var(--theme-text)]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--theme-text)] tracking-tight">
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
                    ? "bg-[var(--theme-bg)] shadow-sm border border-[var(--theme-border)] text-[var(--theme-accent)]"
                    : "text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] hover:text-[var(--theme-text)]"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? "text-[var(--theme-accent)]" : "text-[var(--theme-text-muted)]"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[var(--theme-text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors font-medium"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        
        {/* TOP HEADER */}
        <header className="h-20 px-8 flex items-center justify-end sticky top-0 z-40 bg-[var(--theme-panel)] border-b border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) fetchNotifications();
                }}
                className="p-2.5 bg-[var(--theme-bg)] rounded-full shadow-sm border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-accent)] transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[var(--theme-bg)]"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[var(--theme-text)]">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[var(--theme-accent)] hover:opacity-80 font-medium flex items-center gap-1"
                      >
                        <CheckCheck className="h-3 w-3" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-sm text-[var(--theme-text-muted)] text-center">
                        Loading...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-sm text-[var(--theme-text-muted)] text-center">
                        No notifications
                      </div>
                    ) : (
                      <div className="divide-y divide-[var(--theme-border)]">
                        {notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 hover:bg-[var(--theme-bg)] transition-colors ${
                              !notification.isRead ? "bg-[var(--theme-accent)]/10" : ""
                            }`}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${getNotificationColor(notification.type)}`}
                              ></div>
                              <div>
                                <p className="text-sm font-medium text-[var(--theme-text)]">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-[var(--theme-text-muted)] opacity-70 mt-1">
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
            <div className="h-10 w-10 rounded-full bg-blue-600 shadow-sm border-2 border-[var(--theme-panel)] flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </main>

      {/* Logout Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--theme-panel)] rounded-3xl shadow-2xl max-w-sm w-full p-6 relative border border-[var(--theme-border)]">
            <div className="mb-4 inline-flex p-3 rounded-2xl bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">Log Out</h2>
            <p className="text-sm text-[var(--theme-text-muted)] mb-6">Are you sure you want to log out of your session?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal({ isOpen: false })} 
                className="flex-1 py-2.5 bg-[var(--theme-bg)] text-[var(--theme-text)] rounded-xl font-bold border border-[var(--theme-border)] hover:bg-[var(--theme-border)] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout} 
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-sm hover:bg-red-700 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Layout;