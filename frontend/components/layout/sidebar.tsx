"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  Users,
  ClipboardCheck,
  BarChart3,
  ScrollText,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Assignments", href: "/dashboard/assignments", icon: ClipboardCheck },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Audit Logs", href: "/dashboard/audit-logs", icon: ScrollText },
]

const adminNavigation = [
  { name: "Admin Requests", href: "/dashboard/admin-requests", icon: ShieldCheck },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [orgOpen, setOrgOpen] = useState(false)

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Package className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-foreground">InvenTrack</span>
      </div>

      {/* Organization Selector */}
      <div className="border-b border-border p-4">
        <button
          onClick={() => setOrgOpen(!orgOpen)}
          className="flex w-full items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-xs font-medium text-primary">
              IT
            </div>
            <span>IT Department</span>
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", orgOpen && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}

        <div className="pt-4">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Administration
          </p>
          {adminNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User & Logout */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
            JD
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium text-foreground">John Doe</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
        <Link
          href="/login"
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Link>
      </div>
    </aside>
  )
}
