"use client"

import { Header } from "@/components/layout/header"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Shield,
  UserPlus,
  Settings,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const auditLogs = [
  {
    id: "1",
    action: "ASSET_ASSIGNED",
    description: "MacBook Pro 14\" assigned to John Smith",
    user: "Emily Davis",
    userRole: "Admin",
    ip: "192.168.1.45",
    timestamp: "Jan 24, 2024 10:45:23 AM",
    type: "assignment",
  },
  {
    id: "2",
    action: "USER_CREATED",
    description: "New user account created for Mike Chen",
    user: "Robert Wilson",
    userRole: "Super Admin",
    ip: "192.168.1.12",
    timestamp: "Jan 24, 2024 09:30:15 AM",
    type: "user",
  },
  {
    id: "3",
    action: "ASSET_RETURNED",
    description: "Dell Monitor returned by Marketing Dept",
    user: "Emily Davis",
    userRole: "Admin",
    ip: "192.168.1.45",
    timestamp: "Jan 24, 2024 09:15:42 AM",
    type: "return",
  },
  {
    id: "4",
    action: "ADMIN_APPROVED",
    description: "Admin request approved for Lisa Anderson",
    user: "Robert Wilson",
    userRole: "Super Admin",
    ip: "192.168.1.12",
    timestamp: "Jan 23, 2024 04:22:11 PM",
    type: "admin",
  },
  {
    id: "5",
    action: "SETTINGS_UPDATED",
    description: "Organization settings modified",
    user: "Robert Wilson",
    userRole: "Super Admin",
    ip: "192.168.1.12",
    timestamp: "Jan 23, 2024 03:45:08 PM",
    type: "settings",
  },
  {
    id: "6",
    action: "ASSET_CREATED",
    description: "New batch of 10 monitors added to inventory",
    user: "Emily Davis",
    userRole: "Admin",
    ip: "192.168.1.45",
    timestamp: "Jan 23, 2024 02:30:55 PM",
    type: "create",
  },
  {
    id: "7",
    action: "LOGIN_SUCCESS",
    description: "User login successful",
    user: "John Smith",
    userRole: "Faculty",
    ip: "192.168.1.78",
    timestamp: "Jan 23, 2024 01:15:33 PM",
    type: "auth",
  },
  {
    id: "8",
    action: "ASSET_MAINTENANCE",
    description: "HP LaserJet Pro marked for maintenance",
    user: "Emily Davis",
    userRole: "Admin",
    ip: "192.168.1.45",
    timestamp: "Jan 23, 2024 11:20:19 AM",
    type: "maintenance",
  },
]

const actionIcons = {
  assignment: ArrowUpRight,
  return: ArrowDownRight,
  user: UserPlus,
  admin: Shield,
  settings: Settings,
  create: ArrowUpRight,
  auth: Shield,
  maintenance: RefreshCw,
}

const actionStyles = {
  assignment: "bg-blue-500/10 text-blue-500",
  return: "bg-emerald-500/10 text-emerald-500",
  user: "bg-purple-500/10 text-purple-500",
  admin: "bg-amber-500/10 text-amber-500",
  settings: "bg-zinc-500/10 text-zinc-500",
  create: "bg-cyan-500/10 text-cyan-500",
  auth: "bg-emerald-500/10 text-emerald-500",
  maintenance: "bg-orange-500/10 text-orange-500",
}

export default function AuditLogsPage() {
  return (
    <div className="min-h-screen">
      <Header title="Audit Logs" description="Complete system activity trail" />

      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search logs..." className="pl-9 bg-secondary" />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All Actions</DropdownMenuItem>
                <DropdownMenuItem>Assignments</DropdownMenuItem>
                <DropdownMenuItem>Returns</DropdownMenuItem>
                <DropdownMenuItem>User Management</DropdownMenuItem>
                <DropdownMenuItem>System Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditLogs.map((log) => {
                  const Icon = actionIcons[log.type as keyof typeof actionIcons]
                  const style = actionStyles[log.type as keyof typeof actionStyles]
                  return (
                    <tr
                      key={log.id}
                      className="transition-colors hover:bg-secondary/50"
                    >
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg",
                              style
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <code className="text-xs font-medium text-foreground">
                            {log.action}
                          </code>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-foreground">{log.description}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{log.user}</p>
                          <p className="text-xs text-muted-foreground">{log.userRole}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <code className="rounded bg-secondary px-2 py-1 text-xs text-muted-foreground">
                          {log.ip}
                        </code>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
                        {log.timestamp}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing 8 of 1,247 entries
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                1
              </Button>
              <Button variant="ghost" size="sm">
                2
              </Button>
              <Button variant="ghost" size="sm">
                3
              </Button>
              <span className="flex items-center px-2 text-muted-foreground">...</span>
              <Button variant="ghost" size="sm">
                156
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
