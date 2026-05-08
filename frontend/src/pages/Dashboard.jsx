import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  CheckCircle2,
  UserCheck,
  Wrench,
  AlertCircle,
  Activity,
  Clock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import api from "../api";
import toast from "react-hot-toast";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/stats/dashboard");
        setData(response.data);
      } catch (error) {
        toast.error("Failed to load dashboard statistics");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const { inventoryOverview, userOverview, requestsOverview, recentActivity } = data;

  // Formatting data for the Recharts Pie Chart (by item type)
  const chartData = (inventoryOverview.itemDistribution || []).map((item, index) => ({
    name: item.name,
    value: item.count,
    color: item.name === "Others" ? "#9CA3AF" : COLORS[index % COLORS.length],
  }));

  // Helper arrays for mapping UI cards
  const topMetrics = [
    {
      title: "Total Assets",
      value: inventoryOverview.total,
      icon: Package,
      color: "text-gray-500",
      bg: "bg-gray-500/10",
    },
    {
      title: "Available",
      value: inventoryOverview.available,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Assigned",
      value: inventoryOverview.assigned,
      icon: UserCheck,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Admin Approval Pending",
      value: requestsOverview?.pendingAdmin || 0,
      icon: Clock,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Hardware Request Pending",
      value: requestsOverview?.pendingHardware || 0,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-text)] tracking-tight">
            Overview
          </h1>
          <p className="text-sm text-[var(--theme-text-muted)] mt-1">
            Real-time statistics across the institution
          </p>
        </div>
      </div>

      {/* Top Row: Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {topMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-[var(--theme-panel)] border border-[var(--theme-border)] p-6 rounded-4xl shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300"
            >
              <div
                className={`h-14 w-14 rounded-2xl flex items-center justify-center ${metric.bg}`}
              >
                <Icon className={`h-7 w-7 ${metric.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--theme-text-muted)]">
                  {metric.title}
                </p>
                <h3 className="text-3xl font-bold text-[var(--theme-text)] mt-1">
                  {metric.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Inventory Distribution Chart */}
        <div className="lg:col-span-2 bg-[var(--theme-panel)] border border-[var(--theme-border)] p-8 rounded-4xl shadow-sm">
          <h2 className="text-lg font-bold text-[var(--theme-text)] mb-6">
            Inventory Distribution
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Administrative Alerts */}
        <div className="bg-[var(--theme-panel)] border border-[var(--theme-border)] p-8 rounded-4xl shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-[var(--theme-text)] mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-[var(--theme-text-muted)]" />
            System Status
          </h2>

          <div className="flex-1 space-y-4">
            <div className="bg-[var(--theme-bg)] rounded-2xl p-5 border border-[var(--theme-border)]">
              <p className="text-sm text-[var(--theme-text-muted)] font-medium">
                Total Registered Users
              </p>
              <h4 className="text-3xl font-bold text-[var(--theme-text)] mt-2">
                {userOverview.total}
              </h4>
            </div>

            <div className="bg-orange-500/10 rounded-2xl p-5 border border-orange-500/20">
              <p className="text-sm text-orange-500 font-medium">
                Pending Approvals
              </p>
              <div className="flex items-end justify-between mt-2">
                <h4 className="text-3xl font-bold text-orange-600">
                  {userOverview.pendingRequests}
                </h4>
                <button
                  onClick={() => navigate("/dashboard/users")}
                  className="text-sm font-semibold text-orange-500 hover:underline"
                >
                  Review &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity Feed */}
      <div className="bg-[var(--theme-panel)] border border-[var(--theme-border)] p-8 rounded-4xl shadow-sm">
        <h2 className="text-lg font-bold text-[var(--theme-text)] mb-6 flex items-center gap-2">
          <Activity className="h-5 w-5 text-[var(--theme-text-muted)]" />
          Recent Hardware Activity
        </h2>

        {recentActivity.length === 0 ? (
          <p className="text-[var(--theme-text-muted)] text-center py-6">
            No recent activity found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--theme-border)]">
                  <th className="pb-3 text-sm font-semibold text-[var(--theme-text-muted)] pl-2">
                    Asset Name
                  </th>
                  <th className="pb-3 text-sm font-semibold text-[var(--theme-text-muted)]">
                    ID Tag
                  </th>
                  <th className="pb-3 text-sm font-semibold text-[var(--theme-text-muted)]">
                    Current Status
                  </th>
                  <th className="pb-3 text-sm font-semibold text-[var(--theme-text-muted)]">
                    Assigned To
                  </th>
                  <th className="pb-3 text-sm font-semibold text-[var(--theme-text-muted)] text-right pr-2">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-[var(--theme-border)] hover:bg-[var(--theme-bg)] transition-colors"
                  >
                    <td className="py-4 pl-2 font-medium text-[var(--theme-text)]">
                      {item.catalogItem?.name || "Unknown"}
                    </td>
                    <td className="py-4 text-sm text-[var(--theme-text-muted)] font-mono">
                      {item.identifier}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                        ${item.status === "Issued" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : ""}
                        ${item.status === "Returned" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""}
                      `}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-[var(--theme-text)]">
                      {item.user ? (
                        item.user.fullname
                      ) : (
                        <span className="text-[var(--theme-text-muted)] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 text-sm text-[var(--theme-text-muted)] text-right pr-2">
                      {new Date(item.issuedAt || item.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
