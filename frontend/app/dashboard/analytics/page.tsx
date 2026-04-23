"use client"

import { Header } from "@/components/layout/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Package, CheckCircle, Clock, Users } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts"

const stats = [
  { title: "Total Assets", value: 127, icon: Package, variant: "primary" as const },
  { title: "Approvals", value: 89, icon: CheckCircle, variant: "success" as const },
]

const statusData = [
  { name: "Available", value: 45, color: "#22c55e" },
  { name: "Assigned", value: 52, color: "#3b82f6" },
  { name: "In Review", value: 12, color: "#f59e0b" },
  { name: "Maintenance", value: 8, color: "#f97316" },
  { name: "Retired", value: 10, color: "#6b7280" },
]

const categoryData = [
  { name: "Hardware", count: 68 },
  { name: "Software", count: 35 },
  { name: "Accessories", count: 24 },
]

const trendData = [
  { month: "Jan", assignments: 12, returns: 8 },
  { month: "Feb", assignments: 19, returns: 14 },
  { month: "Mar", assignments: 15, returns: 12 },
  { month: "Apr", assignments: 22, returns: 18 },
  { month: "May", assignments: 28, returns: 22 },
  { month: "Jun", assignments: 18, returns: 15 },
]

const topUsers = [
  { name: "John Smith", items: 8 },
  { name: "Sarah Johnson", items: 6 },
  { name: "Mike Chen", items: 5 },
  { name: "Emily Davis", items: 4 },
  { name: "Lisa Anderson", items: 4 },
]

const topApprovers = [
  { name: "Emily Davis", approvals: 34 },
  { name: "Robert Wilson", approvals: 28 },
  { name: "Admin User", approvals: 15 },
]

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen">
      <Header
        title="Analytics"
        description="Monitor productivity and asset metrics"
      />

      <div className="p-6">
        {/* Time Filter */}
        <div className="mb-6 flex gap-2">
          {["7 Days", "30 Days", "90 Days", "All Time"].map((period, idx) => (
            <button
              key={period}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                idx === 1
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              variant={stat.variant}
            />
          ))}
          <StatsCard
            title="Pending Review"
            value={12}
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Active Users"
            value={86}
            icon={Users}
            variant="default"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Status Distribution */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground">Assets by Status</h3>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    formatter={(value) => (
                      <span style={{ color: "hsl(var(--muted-foreground))" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assignment Trends */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground">Assignment Trends</h3>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "hsl(var(--muted-foreground))" }}>{value}</span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="assignments"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="returns"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: "#22c55e" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Users */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground">Top Creators</h3>
            <div className="mt-4 space-y-3">
              {topUsers.map((user, idx) => (
                <div key={user.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{idx + 1}.</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.items}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-cyan-500"
                        style={{ width: `${(user.items / 8) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Approvers */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground">Top Approvers</h3>
            <div className="mt-4 space-y-3">
              {topApprovers.map((user, idx) => (
                <div key={user.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{idx + 1}.</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.approvals}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${(user.approvals / 34) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground">By Category</h3>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
