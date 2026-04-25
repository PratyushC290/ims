import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  CheckCircle2,
  UserCheck,
  Wrench,
  AlertCircle,
  Activity,
  TrendingUp,
  Users,
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

/* ─── shared dark-theme tokens (mirrors Inventory.jsx) ─────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .dash-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

  @keyframes dash-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dash-row-in {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(37,99,235,0.35); }
    70%  { box-shadow: 0 0 0 8px rgba(37,99,235,0); }
    100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
  }

  .dash-card {
    background: rgba(20,20,24,0.95);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03);
    transition: transform 0.22s cubic-bezier(.16,1,.3,1), box-shadow 0.22s;
  }
  .dash-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05);
  }

  .stat-card {
    background: rgba(20,20,24,0.95);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03);
    padding: 26px 24px;
    display: flex;
    align-items: center;
    gap: 18px;
    cursor: default;
    transition: transform 0.22s cubic-bezier(.16,1,.3,1),
                box-shadow 0.22s cubic-bezier(.16,1,.3,1),
                border-color 0.22s;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 56px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.09);
    border-color: rgba(255,255,255,0.12);
  }

  .stat-icon {
    height: 52px; width: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }
  .stat-card:hover .stat-icon { transform: scale(1.08); }

  .inv-th {
    padding: 13px 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #52525b;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    white-space: nowrap;
  }
  .inv-td {
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    vertical-align: middle;
  }

  .dash-row {
    transition: background 0.15s ease;
    animation: dash-row-in 0.35s cubic-bezier(.16,1,.3,1) both;
  }
  .dash-row:hover { background: rgba(255,255,255,0.03) !important; }

  .section-animate-1 { animation: dash-fade-up 0.45s cubic-bezier(.16,1,.3,1) 0.05s both; }
  .section-animate-2 { animation: dash-fade-up 0.45s cubic-bezier(.16,1,.3,1) 0.13s both; }
  .section-animate-3 { animation: dash-fade-up 0.45s cubic-bezier(.16,1,.3,1) 0.21s both; }
  .section-animate-4 { animation: dash-fade-up 0.45s cubic-bezier(.16,1,.3,1) 0.29s both; }

  .badge-available { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
  .badge-assigned  { background: rgba(37,99,235,0.12);  color: #60a5fa; border: 1px solid rgba(37,99,235,0.2);  }
  .badge-maint     { background: rgba(245,158,11,0.12); color: #fbbf24; border: 1px solid rgba(245,158,11,0.2); }

  .review-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 14px;
    background: rgba(251,146,60,0.12);
    border: 1px solid rgba(251,146,60,0.25);
    color: #fb923c;
    font-size: 12px; font-weight: 600; border-radius: 9px;
    cursor: pointer;
    transition: background 0.15s, transform 0.15s;
  }
  .review-btn:hover { background: rgba(251,146,60,0.22); transform: translateY(-1px); }

  .divider { height: 1px; background: rgba(255,255,255,0.05); margin: 0; }

  .custom-tooltip {
    background: rgba(20,20,24,0.98) !important;
    border: 1px solid rgba(255,255,255,0.09) !important;
    border-radius: 14px !important;
    padding: 10px 14px !important;
    box-shadow: 0 12px 32px rgba(0,0,0,0.6) !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 12px !important;
    color: #d4d4d8 !important;
  }

  .icon-cell {
    height: 36px; width: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.07);
    flex-shrink: 0;
  }

  .pending-pulse {
    animation: pulse-ring 2.2s cubic-bezier(.455,.03,.515,.955) infinite;
  }
`;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    return (
      <div className="custom-tooltip" style={{ background: "rgba(20,20,24,0.98)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: "10px 14px", boxShadow: "0 12px 32px rgba(0,0,0,0.6)", fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#d4d4d8" }}>
        <span style={{ fontWeight: 700, color: "#f4f4f5" }}>{name}</span>: {value} assets
      </div>
    );
  }
  return null;
};

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
      <div className="dash-root h-full w-full flex items-center justify-center" style={{ minHeight: 300 }}>
        <style>{css}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ height: 32, width: 32, border: "2.5px solid rgba(96,165,250,0.2)", borderTopColor: "#60a5fa", borderRadius: "50%", animation: "spin 0.85s linear infinite" }} />
          <p style={{ color: "#52525b", fontSize: 13 }}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { inventoryOverview, userOverview, recentActivity } = data;

  const chartData = [
    { name: "Available", value: inventoryOverview.available, color: "#10B981" },
    { name: "Assigned", value: inventoryOverview.assigned, color: "#3B82F6" },
    { name: "Maintenance", value: inventoryOverview.maintenance, color: "#F59E0B" },
  ];

  const topMetrics = [
    {
      title: "Total Assets",
      value: inventoryOverview.total,
      icon: Package,
      iconColor: "#a1a1aa",
      iconBg: "rgba(161,161,170,0.1)",
      iconBorder: "rgba(161,161,170,0.15)",
      accent: "#a1a1aa",
      sub: "Across all categories",
    },
    {
      title: "Available",
      value: inventoryOverview.available,
      icon: CheckCircle2,
      iconColor: "#34d399",
      iconBg: "rgba(16,185,129,0.1)",
      iconBorder: "rgba(16,185,129,0.2)",
      accent: "#34d399",
      sub: "Ready to assign",
    },
    {
      title: "Assigned",
      value: inventoryOverview.assigned,
      icon: UserCheck,
      iconColor: "#60a5fa",
      iconBg: "rgba(37,99,235,0.1)",
      iconBorder: "rgba(37,99,235,0.2)",
      accent: "#60a5fa",
      sub: "Currently in use",
    },
    {
      title: "In Maintenance",
      value: inventoryOverview.maintenance,
      icon: Wrench,
      iconColor: "#fbbf24",
      iconBg: "rgba(245,158,11,0.1)",
      iconBorder: "rgba(245,158,11,0.2)",
      accent: "#fbbf24",
      sub: "Under repair",
    },
  ];

  const statusBadge = (status) => {
    const map = {
      Available: { cls: "badge-available", dot: "#34d399" },
      Assigned: { cls: "badge-assigned", dot: "#60a5fa" },
      "Under Maintenance": { cls: "badge-maint", dot: "#fbbf24" },
    };
    const cfg = map[status] || { cls: "", dot: "#71717a" };
    return (
      <span className={cfg.cls} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
        <span style={{ height: 6, width: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
        {status}
      </span>
    );
  };


  return (
    <div className="dash-root" style={{ maxWidth: 1280, margin: "0 auto" }}>
      <style>{css}</style>

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="section-animate-1" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3f3f46", marginBottom: 6 }}>
            WELCOME BACK
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f4f4f5", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Overview
          </h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 5 }}>
            Real-time statistics across the institution
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "8px 14px" }}>
          <Clock style={{ height: 13, width: 13, color: "#52525b" }} />
          <span style={{ fontSize: 12, color: "#52525b", fontFamily: "'JetBrains Mono', monospace" }}>
            {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      <div className="section-animate-2" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        {topMetrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div key={i} className="stat-card" style={{ animationDelay: `${0.08 + i * 0.06}s` }}>
              <div
                className="stat-icon"
                style={{ background: metric.iconBg, border: `1px solid ${metric.iconBorder}` }}
              >
                <Icon style={{ height: 22, width: 22, color: metric.iconColor }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#52525b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
                  {metric.title}
                </p>
                <h3 style={{ fontSize: 32, fontWeight: 700, color: "#f4f4f5", margin: 0, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {metric.value}
                </h3>
                <p style={{ fontSize: 11, color: "#3f3f46", marginTop: 5 }}>{metric.sub}</p>
              </div>
              {/* right accent bar */}
              <div style={{ width: 3, height: 44, borderRadius: 4, background: metric.iconBg, border: `1px solid ${metric.iconBorder}`, alignSelf: "center" }} />
            </div>
          );
        })}
      </div>

      {/* ── Middle Row ──────────────────────────────────────────────── */}
      <div className="section-animate-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>

        {/* Donut Chart — spans 2 cols */}
        <div className="dash-card" style={{ gridColumn: "span 2", padding: "28px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f4f4f5", margin: 0 }}>
                Inventory Distribution
              </h2>
              <p style={{ fontSize: 12, color: "#52525b", marginTop: 3 }}>Asset allocation by status</p>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {chartData.map((d) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ height: 8, width: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#71717a", fontWeight: 500 }}>{d.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Status — 1 col */}
        <div className="dash-card" style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <AlertCircle style={{ height: 16, width: 16, color: "#52525b" }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f4f4f5", margin: 0 }}>System Status</h2>
          </div>

          {/* Total Users */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ height: 28, width: 28, borderRadius: 8, background: "rgba(161,161,170,0.1)", border: "1px solid rgba(161,161,170,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users style={{ height: 14, width: 14, color: "#a1a1aa" }} />
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#52525b", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Registered Users
              </p>
            </div>
            <h4 style={{ fontSize: 30, fontWeight: 700, color: "#f4f4f5", margin: 0, letterSpacing: "-0.02em" }}>
              {userOverview.total}
            </h4>
          </div>

          {/* Pending */}
          <div style={{ background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.15)", borderRadius: 14, padding: "18px 18px", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div
                className={userOverview.pendingRequests > 0 ? "pending-pulse" : ""}
                style={{ height: 28, width: 28, borderRadius: 8, background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <TrendingUp style={{ height: 14, width: 14, color: "#fb923c" }} />
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#92400e", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Pending Approvals
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <h4 style={{ fontSize: 30, fontWeight: 700, color: "#fb923c", margin: 0, letterSpacing: "-0.02em" }}>
                {userOverview.pendingRequests}
              </h4>
              <button className="review-btn" onClick={() => navigate("/dashboard/users")}>
                Review →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Activity ─────────────────────────────────────────── */}
      <div className="dash-card section-animate-4" style={{ overflow: "hidden" }}>
        <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <Activity style={{ height: 16, width: 16, color: "#52525b" }} />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f4f4f5", margin: 0 }}>Recent Hardware Activity</h2>
          {recentActivity.length > 0 && (
            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: "#3f3f46", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "2px 8px", fontFamily: "'JetBrains Mono', monospace" }}>
              {recentActivity.length} entries
            </span>
          )}
        </div>

        {recentActivity.length === 0 ? (
          <div style={{ padding: "52px 20px", textAlign: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ height: 44, width: 44, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Activity style={{ height: 20, width: 20, color: "#52525b" }} />
              </div>
              <p style={{ color: "#52525b", fontSize: 13 }}>No recent activity found.</p>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Asset Name", "ID Tag", "Status", "Assigned To", "Last Updated"].map((h, i) => (
                    <th key={h} className="inv-th" style={{ textAlign: i === 4 ? "right" : "left" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item, idx) => (
                  <tr key={item._id} className="dash-row" style={{ animationDelay: `${idx * 0.04}s` }}>
                    <td className="inv-td">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="icon-cell">
                          <Package style={{ height: 15, width: 15, color: "#60a5fa" }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7" }}>{item.name}</span>
                      </div>
                    </td>
                    <td className="inv-td">
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#71717a", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "3px 8px", borderRadius: 6 }}>
                        {item.identifier}
                      </span>
                    </td>
                    <td className="inv-td">{statusBadge(item.status)}</td>
                    <td className="inv-td" style={{ fontSize: 13 }}>
                      {item.assignedTo ? (
                        <span style={{ color: "#d4d4d8", fontWeight: 500 }}>{item.assignedTo.fullname}</span>
                      ) : (
                        <span style={{ color: "#3f3f46", fontStyle: "italic" }}>Unassigned</span>
                      )}
                    </td>
                    <td className="inv-td" style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 12, color: "#52525b", fontFamily: "'JetBrains Mono', monospace" }}>
                        {new Date(item.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
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